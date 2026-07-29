# Account security

## Identity rules

- Email input is trimmed and lower-cased.
- Consumer `gmail.com` and `googlemail.com` addresses share one canonical
  namespace. Dots and `+tags` in the local part are ignored.
- Dots and plus signs remain significant for every other domain, including
  Google Workspace custom domains.
- Google identities are permanently keyed by the verified OpenID Connect
  `sub` claim, not by a changeable email address.

The customer-facing `User.email` remains unchanged for communication and
reservation snapshots. `User.canonicalEmail` is used only for identity
discovery and uniqueness.

## Authentication flows

### Password signup

1. `POST /api/auth/signup` validates the email and password policy.
2. The account is created without an authenticated session.
3. A hashed, single-use `VERIFY_EMAIL` challenge is stored.
4. The customer receives a 30-minute verification link.
5. `/verify-email/[token]` requires an explicit confirmation click.
6. Password sign-in remains blocked until `emailVerifiedAt` is set.

Existing unverified accounts can request another link from the sign-in form.

### Password sign-in and email codes

The sign-in form calls `POST /api/auth/login/start` before NextAuth:

- Normal verified customers continue with password sign-in.
- Customers who enabled email codes receive an 8-digit code.
- Administrator and super-administrator password sign-ins always require the
  email code, even when their stored `mfaMode` is `DISABLED`.

Codes expire after 10 minutes, are single-use, have five attempts, and are
stored only as a hash tied to a random challenge token. Direct calls to the
NextAuth credentials endpoint are independently rate-limited and audited.

Email codes protect password sign-in. Google sign-in uses the security controls
of the Google account and does not send a second code to the same Gmail inbox.

### Google sign-in and linking

1. Google must return a verified email and a matching provider subject.
2. A known `(provider, providerSubject)` signs in its linked `User`.
3. A new Google identity searches exact and Gmail-canonical addresses.
4. A matching account is not silently linked. The customer sees a confirmation
   page and a security email is sent after linking.
5. Administrator linking additionally requires the existing password when one
   exists.
6. A Google identity cannot overwrite an existing role, password, profile, or
   reservation snapshot.

Starting the flow from Account → Security creates a short-lived, HTTP-only
linking intent. Choosing a different Google mailbox is refused instead of
switching or creating accounts.

### Password reset and sessions

Password resets now use hashed `RESET_PASSWORD` challenges rather than raw
tokens stored on `User`. A successful reset increments `sessionVersion`.
JWT sessions compare their version with the database and become unusable after
the reset.

## Reservation and payment protection

Unverified users may retain read-only access to existing account history during
the migration, but these operations require `emailVerifiedAt`:

- Creating a reservation.
- Creating or reopening a Stripe Checkout session.

Reservation and payment ownership continues to use the stable `User.id`.

## Deployment

1. Back up the PostgreSQL database.
2. Review migration status:

   ```bash
   npx prisma migrate status
   ```

3. Apply the migration through the normal deployment process:

   ```bash
   npx prisma migrate deploy
   npm run prisma:generate
   ```

4. Audit canonical collisions:

   ```bash
   npm run accounts:audit
   ```

   Exit code `2` means reviewed merges are required.

5. Preview a merge:

   ```bash
   npm run accounts:merge -- --survivor USER_ID --merge OTHER_ID
   ```

6. After checking roles, reservations, profiles, and password presence, apply
   that exact merge:

   ```bash
   npm run accounts:merge -- --survivor USER_ID --merge OTHER_ID --apply
   ```

The merge moves reservations, Google identities, audit events, actor
references, and idempotency ownership in one transaction. It preserves the
chosen survivor's profile, role, email, and password, then invalidates existing
sessions. The losing password is intentionally not copied; the mailbox owner
can use password reset afterward.

Do not run `prisma migrate deploy` blindly on a database that was created with
`prisma db push` but has no migration history. Baseline that database first.

## Operational requirements

- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, Google OAuth credentials, and the existing
  Gmail mailer credentials must be configured.
- Periodically delete expired challenges after the desired audit-retention
  window.
- Review `AuthEvent` for repeated failures and unexpected identity changes.
- Email codes are a practical step-up control, but TOTP or passkeys should be
  the next stronger MFA option.

## Isolated local test environment

The account-security test environment is separate from the default Docker
database:

- PostgreSQL: `localhost:55432`
- Mailpit SMTP: `localhost:1025`
- Mailpit inbox: `http://localhost:8025`
- Isolated Next.js app: `http://localhost:3100`

Create the containers, apply all migrations, and seed the database:

```bash
npm run db:security:setup
```

Start the isolated app:

```bash
npm run dev:security
```

Mailpit captures verification, password-reset, security-notification, and
one-time-code emails. It does not send them to real recipients.

All password-enabled seed accounts use:

```text
Test-password1!
```

| Account | Expected behavior |
| --- | --- |
| `verified.customer@example.com` | Normal verified login and one seeded reservation |
| `unverified.customer@example.com` | Login blocked; resend creates a Mailpit verification email |
| `mfa.customer@example.com` | Password followed by an 8-digit Mailpit code |
| `admin@example.com` | Administrator; email code is mandatory |
| `gmail.alias.customer@gmail.com` | Can also log in as `gmailaliascustomer@gmail.com` |
| `ahmad.fatayerji2004@gmail.com` | Super-admin and real Google-linking candidate |
| `linked.customer@example.com` | Password plus a seeded development Google identity |
| `google.only@example.com` | No password; seeded Google-only identity record |
| `dev.collision@gmail.com` | Intentional unresolved collision |
| `devcollision@gmail.com` | Intentional unresolved collision |

Useful commands:

```bash
npm run db:security:status
npm run db:security:audit
npm run db:security:seed
npm run db:security:stop
```

To permanently remove only the isolated test database and Mailpit containers:

```bash
npm run db:security:destroy
```

Running `npm run db:security:setup` again is safe and reseeds deterministic
records. Google OAuth testing on port `3100` additionally requires this
authorized redirect URI in Google Cloud:

```text
http://localhost:3100/api/auth/callback/google
```

### Local production-domain OAuth

On the configured development PC, the isolated app can run at:

```text
https://glampingboat.fr
```

Start the app and HTTPS proxy together:

```bash
npm run domain:security:setup
npm run dev:security:domain
```

The local hosts entry redirects `glampingboat.fr` to this PC, and the
current-user Windows certificate store trusts the development certificate.
The exact Google OAuth redirect URI is:

```text
https://glampingboat.fr/api/auth/callback/google
```

While the hosts entry exists, the real public `glampingboat.fr` site will not
be reachable from this PC. The hosts-file entry is marked
`glampingboat-account-security-local` so it can be removed safely.

To restore normal public DNS resolution and remove the current-user
development certificate:

```bash
npm run domain:security:remove
```
