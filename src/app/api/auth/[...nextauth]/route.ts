// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@auth"  // alias to ./auth.ts via tsconfig.paths

export const { GET, POST } = handlers
