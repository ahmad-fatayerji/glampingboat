# Glamping Boat

Glamping Boat is a Next.js application for a boat rental/glamping website. It uses Next.js, React, NextAuth, Prisma, PostgreSQL, Tailwind CSS, and Docker for local infrastructure.

## Requirements

Install these before starting the project:

- Git
- Node.js 20.19 or newer. Node 22 LTS or Node 24 also work with the current Prisma version.
- npm, installed with Node.js
- Docker Desktop on Windows/macOS, or Docker Engine plus Docker Compose on Linux
- A PostgreSQL database. The easiest local option is the Docker Compose database service included in this repository.

Optional, depending on what you want to test:

- Google OAuth credentials for Google sign-in
- Gmail app password for contact and password-reset emails

## Project Structure

```text
src/                  Next.js app routes and React components
lib/                  Shared server helpers and Prisma client setup
prisma/               Prisma schema, migrations, and seed script
generated/prisma/     Generated Prisma client output
public/               Static assets, images, audio, and video
scripts/              Utility scripts
compose.yaml          Docker Compose services for app and Postgres
Dockerfile            Production container build
```

## Environment Variables

Create your local environment file from the example:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

The important variables are:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/glampingboat?schema=public"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DB="glampingboat"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GMAIL_USER="your-gmail-address@gmail.com"
GMAIL_APP_PASSWORD="your-gmail-app-password"
CONTACT_EMAIL="contact@example.com"
```

For local development on your host machine, keep `DATABASE_URL` pointing at `localhost`.

For a containerized app running inside Docker Compose, the app must connect to the database service named `db`; `compose.yaml` already sets the container URL to `postgresql://postgres:postgres@db:5432/glampingboat?schema=public`.

Generate a strong `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

On Windows PowerShell, if OpenSSL is unavailable:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Setup on Windows

1. Install Git from `https://git-scm.com/download/win`.
2. Install Node.js 22 LTS from `https://nodejs.org/`.
3. Install Docker Desktop from `https://www.docker.com/products/docker-desktop/`.
4. Start Docker Desktop and make sure it is running.
5. Open PowerShell in the folder where you want the project.
6. Clone the repository:

```powershell
git clone <repository-url>
cd glampingboat
```

7. Install dependencies:

```powershell
npm install
```

8. Create the environment file:

```powershell
Copy-Item .env.example .env
```

9. Start PostgreSQL with Docker Compose:

```powershell
docker compose up -d db
```

10. Generate the Prisma client:

```powershell
npm run prisma:generate
```

11. Apply database migrations:

```powershell
npx prisma migrate deploy
```

For active schema development, use this instead:

```powershell
npx prisma migrate dev
```

12. Seed demo data:

```powershell
npx prisma db seed
```

13. Start the development server:

```powershell
npm run dev
```

14. Open `http://localhost:3000`.

## Setup on Linux

1. Install Git, Node.js 22 LTS, npm, Docker, and Docker Compose.

On Ubuntu/Debian, install the basic packages:

```bash
sudo apt update
sudo apt install -y git curl ca-certificates
```

Install Node.js using your preferred Node version manager or the NodeSource packages. With `nvm`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
```

Install Docker using Docker's official instructions for your distribution:

```bash
docker --version
docker compose version
```

2. Clone the repository:

```bash
git clone <repository-url>
cd glampingboat
```

3. Install dependencies:

```bash
npm install
```

4. Create the environment file:

```bash
cp .env.example .env
```

5. Start PostgreSQL:

```bash
docker compose up -d db
```

6. Generate the Prisma client:

```bash
npm run prisma:generate
```

7. Apply migrations:

```bash
npx prisma migrate deploy
```

For active schema development, use this instead:

```bash
npx prisma migrate dev
```

8. Seed demo data:

```bash
npx prisma db seed
```

9. Start the development server:

```bash
npm run dev
```

10. Open `http://localhost:3000`.

## Running with Docker Compose

Use this path when you want both the app and PostgreSQL to run in containers.

1. Create `.env` from `.env.example` and fill in secrets:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

2. Build and start the containers:

```bash
docker compose up --build
```

3. In another terminal, apply migrations inside the running web container:

```bash
docker compose exec web npx prisma migrate deploy
```

4. Optionally seed demo data:

```bash
docker compose exec web npx prisma db seed
```

5. Open `http://localhost:3000`.

Stop containers:

```bash
docker compose down
```

Stop containers and remove the database volume:

```bash
docker compose down -v
```

Removing the volume deletes the local PostgreSQL data.

## Common Commands

```bash
npm run dev              # Start the Next.js dev server
npm run build            # Build the production app
npm run start            # Start the production server after build
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript checks
npm run prisma:generate  # Generate Prisma client
npx prisma migrate dev   # Create/apply migrations during development
npx prisma migrate deploy # Apply existing migrations
npx prisma db seed       # Seed demo data
npx prisma studio        # Open Prisma Studio
```

## Authentication and Email Setup

Google sign-in requires OAuth credentials from Google Cloud Console:

1. Create or select a Google Cloud project.
2. Configure the OAuth consent screen.
3. Create OAuth client credentials for a web application.
4. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.
5. Put the client ID and secret in `.env`.

Email sending uses Gmail with an app password:

1. Enable 2-Step Verification on the Gmail account.
2. Create an app password.
3. Set `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `CONTACT_EMAIL` in `.env`.

Without these values, pages that rely on Google sign-in or email delivery will not work fully, but the app can still run locally.

## Troubleshooting

If Prisma cannot connect to the database, confirm PostgreSQL is running:

```bash
docker compose ps
```

For local development, `DATABASE_URL` should use `localhost`. Inside Docker Compose, the web container should use the `db` hostname, which is handled by `compose.yaml`.

If the Prisma client is missing or imports from `generated/prisma` fail, regenerate it:

```bash
npm run prisma:generate
```

If port `3000` or `5432` is already in use, stop the conflicting service or change the port mapping in `compose.yaml`.

If dependencies behave unexpectedly, reinstall them:

```bash
rm -rf node_modules package-lock.json
npm install
```

On Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```
