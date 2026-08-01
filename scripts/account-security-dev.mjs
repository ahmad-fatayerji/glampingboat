import { spawnSync } from "node:child_process";

const DATABASE_URL =
  "postgresql://glampingboat_dev:glampingboat_dev@localhost:55432/glampingboat_security?schema=public";
const COMPOSE_FILE = "compose.account-security.yaml";

const developmentEnvironment = {
  ...process.env,
  DATABASE_URL,
  NEXTAUTH_URL: "http://localhost:3100",
  SMTP_HOST: "localhost",
  SMTP_PORT: "1025",
  SMTP_SECURE: "false",
  MAIL_FROM: "dev@glampingboat.test",
  NEXT_DIST_DIR: ".next-security",
  NODE_ENV: "development",
};

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: developmentEnvironment,
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function compose(...args) {
  run("docker", ["compose", "-f", COMPOSE_FILE, ...args]);
}

function migrate() {
  run("npx", ["prisma", "migrate", "deploy"]);
  run("npm", ["run", "prisma:generate"]);
}

function seed() {
  run("npx", ["tsx", "prisma/seed.account-security.ts"]);
}

const command = process.argv[2] ?? "help";

switch (command) {
  case "setup":
    compose("up", "-d", "--wait");
    migrate();
    seed();
    console.log("\nAccount-security test environment is ready:");
    console.log("  App:     npm run dev:security");
    console.log("  Website: http://localhost:3100/account");
    console.log("  Email:   http://localhost:8025");
    console.log("  DB:      localhost:55432");
    break;
  case "up":
    compose("up", "-d", "--wait");
    break;
  case "stop":
    compose("stop");
    break;
  case "destroy":
    compose("down", "--volumes", "--remove-orphans");
    break;
  case "migrate":
    migrate();
    break;
  case "seed":
    seed();
    break;
  case "status":
    run("npx", ["prisma", "migrate", "status"]);
    break;
  case "audit":
    run("npx", ["tsx", "scripts/account-collisions.ts", "audit"]);
    break;
  case "app":
    run("npx", ["next", "dev", "-p", "3100"]);
    break;
  case "app-domain":
    developmentEnvironment.NEXTAUTH_URL = "https://glampingboat.fr";
    developmentEnvironment.ACCOUNT_SECURITY_DEV_DOMAIN = "true";
    developmentEnvironment.AUTH_TRUSTED_PROXY_HOPS = "1";
    run("npx", ["next", "dev", "-p", "3100"]);
    break;
  default:
    console.log("Usage: node scripts/account-security-dev.mjs <command>");
    console.log(
      "Commands: setup, up, stop, destroy, migrate, seed, status, audit, app, app-domain"
    );
}
