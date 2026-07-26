import { spawn } from "node:child_process";

const child = spawn(
  "stripe",
  ["listen", "--forward-to", "localhost:3000/api/stripe/webhook"],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
  }
);

child.on("error", () => {
  console.warn(
    [
      "Stripe CLI was not found, so local Stripe webhooks are not running.",
      "Install it on Windows with:",
      "  winget install Stripe.StripeCLI",
      "Then run:",
      "  stripe login",
      "  npm run dev",
    ].join("\n")
  );
});

child.on("exit", (code) => {
  if (code === 0 || code === null) return;

  console.warn(
    [
      "Stripe webhook listener stopped.",
      "If the Stripe CLI is not installed, install it with:",
      "  winget install Stripe.StripeCLI",
      "Then authenticate with:",
      "  stripe login",
    ].join("\n")
  );
});
