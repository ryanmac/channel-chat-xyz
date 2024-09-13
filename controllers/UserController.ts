// controllers/UserController.ts
import errorHandler from "@/helpers/errorHandler";
import prisma from "@/lib/prisma";
import jsonUtilsImpl from "@/utils/jsonUtils";
import { generateUsername, generateUniqueUsername } from "@/utils/userUtils";
import { BadgeType } from "@/utils/badgeManagement";
import type { User, UserBadge, Badge, Transaction, Prisma } from "@prisma/client";

type UserWithBadges = User & { badges: (UserBadge & { badge: Badge })[] };

export default class UserController {
  async create(name: string, email: string, password?: string, image?: string): Promise<UserWithBadges | null> {
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
        data: userJson,
        include: {
          badges: {
            include: {
              badge: true
            }
          }
        }
      });

      return result;
    } catch (e) {
      console.error("Error creating user:", e);
      return null;
    }
  }

  async assignBadgesToUser(userId: string, badgeNames: string[]): Promise<void> {
    try {
      // Fetch the user
      const user = await this.getUserById(userId);
  
      if (!user) {
        throw new Error('User not found');
      }
  
      // Fetch the existing badges for the user
      const existingBadges = await prisma.userBadge.findMany({
        where: { userId: user.id },
        include: { badge: true },
      });
  
      // Create a set of existing badge names to easily filter out duplicates
      const existingBadgeNames = new Set(existingBadges.map(ub => ub.badge.name));
      
      // Filter out the new badge names that need to be assigned
      const newBadgeNames = badgeNames.filter(name => !existingBadgeNames.has(name));
  
      if (newBadgeNames.length > 0) {
        // Fetch the badge IDs for the new badge names
        const newBadges = await prisma.badge.findMany({
          where: {
            name: { in: newBadgeNames }
          }
        });
  
        // Get the badge IDs from the fetched badges
        const newBadgeIds = newBadges.map(badge => badge.id);
  
        // Create the user-badge associations
        await prisma.userBadge.createMany({
          data: newBadgeIds.map(badgeId => ({
            userId: user.id,
            badgeId,
          })),
          skipDuplicates: true,
        });
      }
    } catch (e) {
      console.error('Error assigning badges to user:', e);
      console.error('User ID:', userId);
      console.error('Badge Names:', badgeNames);
      throw e;
    }
  }

  async assignTransactionsToUser(userId: string, sessionId: string): Promise<void> {
    // Assign transactions to the authenticated user based on the sessionId
    // Records to update userId are those with null for userId and the same sessionId
    // If they exist, update the userId to the authenticated user
    // first, fetch the transactions with the sessionId
    const transactions = await prisma.transaction.findMany({
      where: {
        sessionId,
        userId: null,
      },
    });
    if (!transactions) {
      return;
    }
    try {
      await prisma.transaction.updateMany({
        where: {
          sessionId,
          userId: null,
        },
        data: {
          userId,
        },
      });
    } catch (e) {
      console.error('Error assigning transactions to user:', e);
      console.error('User ID:', userId);
      console.error('Session ID:', sessionId);
      throw e;
    }
  }

  async findOrCreateUser(email: string, name: string, image?: string, sessionId?: string): Promise<UserWithBadges | null> {
    try {
      let user = await this.getUserByEmail(email);
      if (!user) {
        user = await this.create(name, email, undefined, image);
        if (!user) {
          throw new Error("User creation failed");
        }
      }

      if (sessionId) {
        // Assign transactions to the authenticated user
        const transactions = await prisma.transaction.findMany({
          where: { sessionId },
        });


        // Assign session badges to the authenticated user
        const sessionBadge = await prisma.sessionBadge.findUnique({
          where: { sessionId },
        });

        if (sessionBadge) {
          const badges = sessionBadge.badges.split(',') as BadgeType[];
          if (badges.length > 0) {
            await this.assignBadgesToUser(user.id, badges);
            // Refresh user data to include new badges
            user = await this.getUserById(user.id);
          }

          // Delete the SessionBadge after transfer
          await prisma.sessionBadge.delete({
            where: { id: sessionBadge.id },
          });
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

  async getUserByEmail(email: string): Promise<UserWithBadges | null> {
    try {
      const result = await prisma.user.findUnique({
        where: { email },
        include: {
          badges: { include: { badge: true } },
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

  async getUserById(id: string): Promise<UserWithBadges | null> {
    try {
      const result = await prisma.user.findUnique({
        where: { id },
        include: {
          badges: { include: { badge: true } },
          chats: true,
        }
      });
      return result;
    } catch (e) {
      console.error("Error getting user by ID:", e);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<UserWithBadges | null> {
    try {
      const result = await prisma.user.findUnique({
        where: { username },
        include: {
          badges: { include: { badge: true } },
          chats: true,
        }
      });
      return result;
    } catch (e) {
      console.error("Error getting user by username:", e);
      return null;
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