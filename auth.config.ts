// auth.config.ts
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import configEnv from "@/config"
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { generateUsername, generateUniqueUsername } from "@/utils/userUtils";
// import UserController from "@/controllers/UserController";

// Ensure clientId and clientSecret are defined
const googleClientId = configEnv.google.clientId ?? "";
const googleClientSecret = configEnv.google.clientSecret ?? "";

async function retryFetch(url: string, options: any, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      // console.log(`Attempting fetch to ${url}, attempt ${i + 1}`);
      const response = await fetch(url, options);
      // console.log(`Fetch successful, status: ${response.status}`);
      return response;
    } catch (error) {
      console.error(`Fetch attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
    }
  }
}

async function getUserController() {
  const { default: UserController } = await import("@/controllers/UserController");
  return new UserController();
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.username = user.username;
        session.user.role = user.role;
      }

      if (token && !session.user.username) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id || "";
        if (!user.username) {
          let username = generateUsername();
          username = await generateUniqueUsername(username);
          await prisma.user.update({
            where: { id: user.id },
            data: { username },
          });
          token.username = username;
        } else {
          token.username = user.username;
        }
        token.role = user.role || "";
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  events: {
    async linkAccount({user, account, profile}) {
      const userController = await getUserController();
      await userController.setEmailVerifiedById(user.id || '');

      // Get the results after userController is updated
      const updatedUser = await userController.getUserById(user.id || '');
      // console.log("Updated User:", updatedUser);

    }
  },
  // Ensure correct URLs
  debug: process.env.NEXT_PUBLIC_ENV === "dev",
  secret: process.env.NEXTAUTH_SECRET,
};