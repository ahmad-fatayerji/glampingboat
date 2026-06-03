# Docker and Production Deploy

## Local Docker

Build and run the app plus PostgreSQL locally:

```bash
docker compose up --build
```

Apply database migrations inside the running app container:

```bash
docker compose exec web npx prisma migrate deploy
```

Open `http://localhost:3000`.

## Server Setup

Install Docker and Docker Compose on the server, then create a deploy directory:

```bash
sudo mkdir -p /opt/glampingboat
sudo chown "$USER":"$USER" /opt/glampingboat
cd /opt/glampingboat
```

Do not store production secrets in this directory. The GitHub Actions workflow copies only `compose.prod.yaml` to the server and injects environment variables from GitHub repository secrets during each deploy.

## GitHub Actions Secrets

Add these repository secrets in GitHub:

```text
SERVER_HOST       Server IP address
SERVER_USER       SSH user with Docker access
SERVER_SSH_KEY    Private SSH key for that user
DEPLOY_PATH       /opt/glampingboat
GHCR_USERNAME     GitHub username or bot username
GHCR_TOKEN        GitHub token with read:packages access
```

Add these application secrets in GitHub too:

```text
APP_PORT                         80
POSTGRES_USER                    postgres
POSTGRES_PASSWORD                Strong persistent database password
POSTGRES_DB                      glampingboat
NEXTAUTH_URL                     http://YOUR_SERVER_IP
NEXTAUTH_SECRET                  Strong random secret
SUPER_ADMIN_EMAILS               Comma-separated admin emails
ENABLE_GOOGLE_AUTH               false for IP-only preview
GOOGLE_CLIENT_ID                 Google OAuth client ID, or blank
GOOGLE_CLIENT_SECRET             Google OAuth secret, or blank
GMAIL_USER                       Gmail sender, if email is enabled
GMAIL_APP_PASSWORD               Gmail app password, if email is enabled
CONTACT_EMAIL                    Destination contact email
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY pk_test_...
STRIPE_SECRET_KEY                sk_test_...
STRIPE_WEBHOOK_SECRET            whsec_...
```

The workflow builds and pushes the image to GitHub Container Registry on every push to `master`, then SSHes into the server and runs:

```bash
docker compose -f compose.prod.yaml --env-file /tmp/glampingboat.<run-id>.env pull
docker compose -f compose.prod.yaml --env-file /tmp/glampingboat.<run-id>.env run --rm migrate
docker compose -f compose.prod.yaml --env-file /tmp/glampingboat.<run-id>.env up -d web
```

The temporary env file is removed by the deploy script before the SSH session exits. Docker still stores runtime environment values in container metadata because the app needs them while it runs.

## Auth on an IP Address

Credentials login can work on `http://YOUR_SERVER_IP` if `NEXTAUTH_URL` matches that exact origin.

Google OAuth will not work reliably on a raw public IP. Google requires HTTPS redirect URIs and does not allow raw IP hosts, except localhost loopback addresses. For Google sign-in, use a real domain with HTTPS and set the Google authorized redirect URI to:

```text
https://YOUR_DOMAIN/api/auth/callback/google
```

Then set:

```env
NEXTAUTH_URL=https://YOUR_DOMAIN
```

For a temporary customer preview without a domain, either use email/password auth only or put the app behind a temporary HTTPS hostname.

The production example disables the Google button with:

```env
ENABLE_GOOGLE_AUTH=false
```

Set it to `true` after the site has a HTTPS domain and Google OAuth is configured for that domain.
