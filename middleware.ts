import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Rol kontrolü auth.config.ts içindeki `authorized` callback'inde yapılır
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: ["/admin/:path*", "/hasta-paneli/:path*", "/giris-yap", "/kayit-ol"],
};
