// middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    // Only allow access if the JWT (from your Credentials or Google login)
    // contains an `id` property
    authorized({ token }) {
      return Boolean(token?.id)
    },
  },
})

// Optional: only run this middleware on certain paths
export const config = {
  matcher: ["/reserver/:path*", "/le-bateau/:path*", "/acheter/:path*"],
}
