// middleware.ts
export { auth as middleware } from "@auth"

export const config = {
  matcher: [
    "/reserver/:path*",
    "/le-bateau/:path*",
    "/acheter/:path*",
  ],
}
