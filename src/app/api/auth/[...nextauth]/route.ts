import NextAuth from "next-auth";
import { authOptions } from "@auth";
import {
  attachAuthResponseCookies,
  runWithAuthResponseCookies,
} from "@/lib/auth-response-cookies";

const nextAuthHandler = NextAuth(authOptions);

async function handler(...args: Parameters<typeof nextAuthHandler>) {
  const { result, queuedCookies } = await runWithAuthResponseCookies(() =>
    nextAuthHandler(...args) as Promise<Response>
  );
  return attachAuthResponseCookies(result, queuedCookies);
}

export { handler as GET, handler as POST };
