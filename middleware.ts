// middleware.ts
export { auth as middleware } from "@auth"

// Optionally restrict to specific routes:
export const config = {
  matcher: [
    "/reserver/:path*",
    "/le-bateau/:path*",
    "/acheter/:path*",
  ],
}
