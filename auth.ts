import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import type { UserRole } from "@/generated/prisma/client";
import { authorizeCredentials } from "@/lib/auth-credentials";
import {
  createAuthChallenge,
  consumeTokenChallenge,
  getHeaderSecurityContext,
  getAuthCookieOptions,
  getActiveChallenge,
  getLoginRateLimit,
  GOOGLE_LINK_TTL_MS,
  GOOGLE_LINK_CHALLENGE_COOKIE,
  GOOGLE_LINK_INTENT_COOKIE,
  recordAuthEvent,
} from "@/lib/auth-security";
import { normalizeEmailAddress } from "@/lib/email-identity";
import { prisma } from "@/lib/prisma";
import { getEffectiveRoleForEmail, isSuperAdminEmail } from "@/lib/super-admin";
import { getString, isRecord } from "@/lib/type-guards";
import { findAccountCandidates } from "@/lib/user-email-lookup";
import {
  googleCandidateDecision,
  googleLinkIntentMatches,
} from "@/lib/google-auth-decision";
import { queueAuthResponseCookie } from "@/lib/auth-response-cookies";

function readGoogleProfile(profile: unknown) {
  if (!isRecord(profile)) {
    return {};
  }

  return {
    subject: getString(profile, "sub"),
    email: getString(profile, "email"),
    emailVerified: profile.email_verified === true,
    name: getString(profile, "name"),
    picture: getString(profile, "picture"),
    firstName: getString(profile, "given_name"),
    lastName: getString(profile, "family_name"),
  };
}

async function getUserAuthFieldsById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      sessionVersion: true,
    },
  });
}

async function getUserAuthFieldsByEmail(email: string) {
  const normalized = normalizeEmailAddress(email);
  if (!normalized) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      OR: [
        { email: normalized.email },
        { canonicalEmail: normalized.canonicalEmail },
      ],
    },
    select: {
      id: true,
      email: true,
      role: true,
      sessionVersion: true,
    },
  });
}

function getInitialRoleForEmail(email: string): UserRole {
  return isSuperAdminEmail(email) ? "SUPER_ADMIN" : "CUSTOMER";
}

export function isGoogleAuthEnabled() {
  if (process.env.ENABLE_GOOGLE_AUTH === "false") {
    return false;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  return Boolean(
    clientId &&
      clientSecret &&
      !clientId.includes("your-google-client-id") &&
      !clientSecret.includes("your-google-client-secret")
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  ...(process.env.NODE_ENV !== "production" &&
  process.env.ACCOUNT_SECURITY_DEV_DOMAIN === "true"
    ? {
        cookies: {
          sessionToken: {
            name: "__Secure-glampingboat-local.session-token",
            options: {
              httpOnly: true,
              sameSite: "lax" as const,
              path: "/",
              secure: true,
            },
          },
        },
      }
    : {}),
  pages: {
    signIn: "/account",
    error: "/account",
  },
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        challengeToken: { label: "Challenge", type: "hidden" },
        code: { label: "Email code", type: "text" },
      },
      async authorize(creds, request) {
        const context = getHeaderSecurityContext(request.headers ?? {});
        const submittedEmail =
          typeof creds?.email === "string" ? creds.email : null;
        const rateLimit = await getLoginRateLimit({
          email: submittedEmail,
          ipAddress: context.ipAddress,
        });
        if (rateLimit.limited) {
          throw new Error("Too many requests. Try again later.");
        }

        try {
          const result = await authorizeCredentials(
            creds,
            prisma,
            getInitialRoleForEmail
          );
          await prisma.authEvent.create({
            data: {
              userId: result.id,
              type: "SIGN_IN",
              provider: "credentials",
              ipAddress: context.ipAddress,
              subjectHash: rateLimit.subjectHash,
              userAgent: context.userAgent,
            },
          });
          return result;
        } catch (error) {
          await prisma.authEvent.create({
            data: {
              type: "SIGN_IN_FAILED",
              provider: "credentials",
              ipAddress: context.ipAddress,
              subjectHash: rateLimit.subjectHash,
              userAgent: context.userAgent,
            },
          });
          throw error;
        }
      },
    }),
    ...(isGoogleAuthEnabled()
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      const google = readGoogleProfile(profile);
      if (
        !google.subject ||
        !google.email ||
        !google.emailVerified ||
        google.subject !== account.providerAccountId
      ) {
        return "/account?error=GoogleEmailNotVerified";
      }

      const normalized = normalizeEmailAddress(google.email);
      if (!normalized) {
        return "/account?error=InvalidGoogleEmail";
      }

      const cookieStore = await cookies();
      const linkIntentToken = cookieStore.get(GOOGLE_LINK_INTENT_COOKIE)?.value;
      const linkIntent = linkIntentToken
        ? await getActiveChallenge(linkIntentToken, "LINK_GOOGLE_INTENT")
        : null;
      if (linkIntent) {
        const intendedEmail = normalizeEmailAddress(linkIntent.user.email);
        if (
          !intendedEmail ||
          !googleLinkIntentMatches(
            normalized.canonicalEmail,
            intendedEmail.canonicalEmail
          )
        ) {
          return "/account?tab=security&error=GoogleEmailMismatch";
        }
      }

      const existingIdentity = await prisma.authIdentity.findUnique({
        where: {
          provider_providerSubject: {
            provider: "google",
            providerSubject: google.subject,
          },
        },
        include: { user: true },
      });

      if (existingIdentity) {
        if (linkIntent && existingIdentity.userId !== linkIntent.userId) {
          return "/account?tab=security&error=GoogleAlreadyLinked";
        }
        if (linkIntent) {
          await consumeTokenChallenge(linkIntentToken!, "LINK_GOOGLE_INTENT");
          queueAuthResponseCookie({
            name: GOOGLE_LINK_INTENT_COOKIE,
            value: "",
            options: getAuthCookieOptions(0),
          });
        }
        await prisma.authIdentity.update({
          where: { id: existingIdentity.id },
          data: {
            providerEmail: normalized.email,
            lastUsedAt: new Date(),
          },
        });
        user.id = existingIdentity.userId;
        user.email = existingIdentity.user.email;
        await recordAuthEvent({
          userId: existingIdentity.userId,
          type: "SIGN_IN",
          provider: "google",
        });
        return true;
      }

      const candidates = linkIntent
        ? [linkIntent.user]
        : await findAccountCandidates(normalized);

      if (linkIntent) {
        await consumeTokenChallenge(linkIntentToken!, "LINK_GOOGLE_INTENT");
        queueAuthResponseCookie({
          name: GOOGLE_LINK_INTENT_COOKIE,
          value: "",
          options: getAuthCookieOptions(0),
        });
      }

      const candidateDecision = googleCandidateDecision(candidates.length);
      if (candidateDecision === "MERGE_REQUIRED") {
        return "/account?error=AccountMergeRequired";
      }

      if (candidateDecision === "CONFIRM_LINK") {
        const candidate = candidates[0];
        let token: string;
        try {
          ({ token } = await createAuthChallenge({
            userId: candidate.id,
            purpose: "LINK_GOOGLE",
            ttlMs: GOOGLE_LINK_TTL_MS,
            metadata: {
              provider: "google",
              providerSubject: google.subject,
              providerEmail: normalized.email,
            },
          }));
        } catch {
          return "/account?error=TooManyLinkAttempts";
        }

        queueAuthResponseCookie({
          name: GOOGLE_LINK_CHALLENGE_COOKIE,
          value: token,
          options: getAuthCookieOptions(GOOGLE_LINK_TTL_MS),
        });
        return "/account/link-google";
      }

      const createdUser = await prisma.user.create({
        data: {
          email: normalized.email,
          canonicalEmail: normalized.canonicalEmail,
          emailVerifiedAt: new Date(),
          name: google.name ?? "",
          avatar: google.picture ?? "",
          firstName: google.firstName,
          lastName: google.lastName,
          role: getInitialRoleForEmail(normalized.email),
          authIdentities: {
            create: {
              provider: "google",
              providerSubject: google.subject,
              providerEmail: normalized.email,
            },
          },
        },
      });

      user.id = createdUser.id;
      user.email = createdUser.email;
      await recordAuthEvent({
        userId: createdUser.id,
        type: "SIGNUP",
        provider: "google",
      });
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        let authFields = null;

        if (account?.provider && account.providerAccountId) {
          const identity = await prisma.authIdentity.findUnique({
            where: {
              provider_providerSubject: {
                provider: account.provider,
                providerSubject: account.providerAccountId,
              },
            },
            select: { userId: true },
          });
          authFields = identity
            ? await getUserAuthFieldsById(identity.userId)
            : null;
        }

        authFields ??=
          typeof user.id === "string"
            ? await getUserAuthFieldsById(user.id)
            : user.email
              ? await getUserAuthFieldsByEmail(user.email)
              : null;

        if (authFields) {
          token.id = authFields.id;
          token.email = authFields.email;
          token.role = getEffectiveRoleForEmail(
            authFields.email,
            authFields.role
          );
          token.sessionVersion = authFields.sessionVersion;
          token.authInvalid = false;
        }
      } else if (typeof token.id === "string") {
        const authFields = await getUserAuthFieldsById(token.id);
        if (
          !authFields ||
          token.sessionVersion !== authFields.sessionVersion
        ) {
          token.authInvalid = true;
          delete token.id;
        } else {
          token.email = authFields.email;
          token.role = getEffectiveRoleForEmail(
            authFields.email,
            authFields.role
          );
          token.sessionVersion = authFields.sessionVersion;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.authInvalid || typeof token.id !== "string") {
        delete (session as { user?: unknown }).user;
        return session;
      }

      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role ?? "CUSTOMER";
      }

      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
