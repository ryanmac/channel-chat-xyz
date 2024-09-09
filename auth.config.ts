// auth.config.ts
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import configEnv from "@/config"
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";

// Ensure clientId and clientSecret are defined
const googleClientId = configEnv.google.clientId ?? "";
const googleClientSecret = configEnv.google.clientSecret ?? "";

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.username = user.username;
        session.user.role = user.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || ""; // Provide default value
        token.username = user.username || ""; // Provide default value
        token.role = user.role || ""; // Provide default value
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  // Ensure correct URLs
  secret: process.env.DEV_NEXTAUTH_URL,
  debug: process.env.NEXT_PUBLIC_ENV === "dev",
};