// controllers/UserController.ts
import errorHandler from "@/helpers/errorHandler";
import prisma from "@/lib/prisma";
import jsonUtilsImpl from "@/utils/jsonUtils";
import { generateUsername, generateUniqueUsername } from "@/utils/userUtils";
import type { User } from "@prisma/client";
import type { Prisma } from "@prisma/client";

export default class UserController {
  async create(name: string, email: string, password?: string, image?: string): Promise<User | null> {
    try {
      let username = generateUsername();
      username = await generateUniqueUsername(username);
      const userJson: Prisma.UserCreateInput = {
        name,
        email,
        username,
        password,
        image,
        emailVerified: new Date(),
      };

      const result = await prisma.user.create({
        data: userJson
      });

      return result;
    } catch (e) {
      console.error("Error creating user:", e);
      return null;
    }
  }

  async findOrCreateUser(email: string, name: string, image?: string): Promise<User | null> {
    try {
      let user = await this.getUserByEmail(email);
      if (!user) {
        user = await this.create(name, email, undefined, image);
        if (!user) {
          throw new Error("User creation failed");
        }
      }
      return user;
    } catch (e) {
      console.error("Error finding or creating user:", e);
      return null;
    }
  }

  async isEmailExists(email: string) {
    const result = await this.getUserByEmail(email);
    return !jsonUtilsImpl.isEmpty(result);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await prisma.user.findUnique({
        where: { email },
        include: {
          sponsorships: { include: { channel: true } },
          badges: true,
          chats: true,
        }
      });
      return result;
    } catch (e: any) {
      console.error("Error getting user by email:", e);
      const error = new errorHandler();
      error.internalServerError("Email not found");
      return null;
    }
  }

  async getUserById(id: string) {
    try {
      const result = await prisma.user.findUnique({
        where: { id },
        include: {
          sponsorships: { include: { channel: true } },
          badges: true,
          chats: true,
        }
      });
      return result;
    } catch (e) {
      console.error("Error getting user by ID:", e);
      return e;
    }
  }

  async getUserByUsername(username: string) {
    try {
      const result = await prisma.user.findUnique({
        where: { username },
        include: {
          sponsorships: { include: { channel: true } },
          badges: true,
          chats: true,
        }
      });
      return result;
    } catch (e) {
      console.error("Error getting user by username:", e);
      return e;
    }
  }

  async setEmailVerifiedById(id: string) {
    try {
      const result = await prisma.user.update({
        where: { id },
        data: { emailVerified: new Date() }
      });
      return result;
    } catch (e) {
      console.error("Error setting email verified:", e);
      return e;
    }
  }

  async updateUser(id: string, data: { username?: string, name?: string, email?: string, image?: string }) {
    try {
      if (data.username) {
        const existingUser = await prisma.user.findUnique({ where: { username: data.username } });
        if (existingUser && existingUser.id !== id) {
          throw new Error("Username already exists");
        }
      }
      const result = await prisma.user.update({
        where: { id },
        data
      });
      return result;
    } catch (e) {
      console.error("Error updating user:", e);
      throw e;
    }
  }

  async updatePassword(id: string, password: string) {
    try {
      const result = await prisma.user.update({
        where: { id },
        data: { password }
      });
      return result;
    } catch (e) {
      console.error("Error updating password:", e);
      return e;
    }
  }
}