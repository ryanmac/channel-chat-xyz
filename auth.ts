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

// anonymize the values for the configEnv object to print to console for debugging
// This will allow us to see the values of the configEnv object without exposing sensitive information
// Format all values, if they exist to something like 'abc...xyz'. If it's a URL that is shorter than 50 characters, leave it as is (ex. `http://localhost:3000` or `https://channel-chat-xyz.vercel.app`)
// But truncate large URL values like this `postgresql://postgres.ghyltvvsmoxxpaoitqvf:f5nxCyj9bZvM8YWJ@aws-0-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1` to something more anonymized like this:
// `postgresql://postgres.ghy...qvf:f5n...YWJ@aws-0-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
// we can create a function to do this for us by passing in the configEnv object and returning a new object with the values anonymized
function anonymizeConfigEnvValues(configEnv: any) {
    const urlRegex = /^(http|https|postgresql):\/\/[^\s/$.?#].[^\s]*$/i; // Matches URLs that start with http, https, or postgresql

    function anonymizeValue(value: any): any {
        if (typeof value === 'string') {
            if (value.includes('...') || value.trim() === '') {
                // If already anonymized or empty, return it as is
                return value;
            } else if (urlRegex.test(value)) {
                // Handle URLs
                if (value.length > 50) {
                    // Truncate URLs longer than 50 characters
                    return `${value.slice(0, 20)}...${value.slice(-20)}`;
                }
                // URLs shorter than 50 characters are left as is
                return value;
            } else {
                // Anonymize non-URL string values to 'abc...xyz'
                return `${value.slice(0, 3)}...${value.slice(-3)}`;
            }
        } else if (typeof value === 'object' && value !== null) {
            // Recursively handle nested objects
            const anonymizedObject: any = {};
            for (const key in value) {
                anonymizedObject[key] = anonymizeValue(value[key]);
            }
            return anonymizedObject;
        }

        // Return non-string, non-object values as is
        return value;
    }

    return anonymizeValue(configEnv);
}

console.log('configEnv:', JSON.stringify(anonymizeConfigEnvValues(configEnv), null, 2));
// console.log('configEnv:', JSON.stringify(configEnv, null, 2));
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