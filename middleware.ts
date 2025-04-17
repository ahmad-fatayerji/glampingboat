// middleware.ts
import { auth } from "@auth"         // your auth.ts alias
export default auth                  // use your auth() for middleware

// Optionally protect only certain routes:
export const config = {
  matcher: [
    "/reserver/:path*", 
    "/le-bateau/:path*", 
    "/acheter/:path*", 
  ],
}
