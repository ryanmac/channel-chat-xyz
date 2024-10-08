// next-auth/next-auth.d.ts
import { User } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string;
    role?: UserRole;
  }
}

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
      username?: string;
      role?: UserRole;
      name?: string;
      image?: string | undefined;
    };
  }
  interface User {
    username?: string;
    role?: UserRole;
    name?: string;
    image?: string | undefined;
  }
}