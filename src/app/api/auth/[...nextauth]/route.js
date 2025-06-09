// File: src/app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth";
// Impor authOptions dari file terpisah (misalnya src/lib/auth.js)
import { authOptions } from "@/lib/auth"; // <-- authOptions HANYA diimpor dari sini

const handler = NextAuth && NextAuth.default ? NextAuth.default(authOptions) : NextAuth(authOptions);

export { handler as GET, handler as POST };
