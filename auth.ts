// auth.ts
import NextAuth from "next-auth"
import userController from "@/controllers/UserController";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import authConfig from "@/auth.config";
import userImpl from "./data/user/userImpl";
import UserRoleEnum from "./enums/UserRoleEnum";
import configEnv from "@/config";
import { config } from "process";

console.log('configEnv:', JSON.stringify(configEnv, null, 2));
console.log('process.env.NEXTAUTH_SECRET:', !!process.env.NEXTAUTH_SECRET);

const secret = process.env.NEXTAUTH_SECRET || configEnv.nextAuth?.secret;

if (!secret) {
    console.error("NEXTAUTH_SECRET is not set. This is required for secure operation");
    throw new Error("NEXTAUTH_SECRET must be set");
}

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    pages: {
        signIn: "/",
        error: "/auth/error"
    },
    events: {
        async linkAccount({user}) {
            const userControllerHandler = new userController();
            await userControllerHandler.setEmailVerifiedById(user.id || '');
        }
    },
    callbacks: {
        async signIn({user, account}) {
            // Allow OAuth without email verification
            if (account?.provider !== "credentials") return true;


            const userControlledHandler = new userController();
            const existingUser: any = await userControlledHandler.getUserById(user.id as string);

            // Prevent sign in without email verification
            if (!existingUser?.emailVerified) return false;

            // TODO: Add 2FA check

            return true;
        },
        async session({token, session}) {
            if(token.sub && session.user) {
                session.user.id = token.sub;
            }
            
            if(token.role && session.user) {
                session.user.role = token.role as UserRoleEnum;
            }
            return session;

        },
        async jwt({ token }) {
            if(!token.sub) return token;

            const userControlledHandler = new userController();
            const existingUser = await userControlledHandler.getUserById(token.sub);

            if(!existingUser) return token;

            const userForm = new userImpl();
            userForm.initFromDataObject(existingUser);

            token.role = userForm.getRole();
            return token;
        }
    },
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    ...authConfig,
    secret: secret,
});