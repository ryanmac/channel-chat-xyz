// controllers/UserController.ts
import errorHandler from "@/helpers/errorHandler";
import prisma from "@/lib/prisma";
import jsonUtilsImpl from "@/utils/jsonUtils";
import { generateUsername, generateUniqueUsername } from "@/utils/userUtils";
import { BadgeType } from "@/utils/badgeManagement";
import { Prisma } from "@prisma/client";
import type { User, UserBadge, Badge, Transaction } from "@prisma/client";

type UserWithBadges = User & { badges: (UserBadge & { badge: Badge })[] };

interface GetAllUsersOptions {
  search?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

interface SerializedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  badges: string[]; // List of badge names
  createdAt: string; // ISO date string
  emailVerified: string | null;
  chatsCount: number;
  // Add any other fields as needed
}

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

  async assignBadgesToUser(userId: string, badgeNames: string[], sessionId: string): Promise<void> {
    try {
      // Fetch the user
      const user = await this.getUserById(userId);
  
      if (!user) {
        throw new Error('User not found');
      }
  
      // Fetch all transactions related to the session, including channel data
      const transactions = await prisma.transaction.findMany({
        where: { sessionId },
        include: { channel: true },
      });
  
      // Ensure that transactions exist
      if (!transactions.length) {
        console.error(`No transactions available for badge assignment.`);
        throw new Error('No available transactions for badge assignment');
      }
  
      // Fetch the existing badges for the user, including channel information
      const existingBadges = await prisma.userBadge.findMany({
        where: { userId: user.id },
        include: { badge: true, channel: true },
      });
  
      // Create a set of existing badge names with their associated channels to filter out duplicates
      const existingBadgeKeySet = new Set(
        existingBadges.map((ub) => `${ub.badge.name}:${ub.channelId || 'no_channel'}`)
      );
  
      console.log(`Existing badges for user ${user.id}: ${Array.from(existingBadgeKeySet).join(', ')}`);
  
      // Iterate through each badge name that needs to be assigned
      for (const badgeName of badgeNames) {
        // Fetch the badge by name
        const badge = await prisma.badge.findFirst({
          where: { name: badgeName },
        });
  
        if (!badge) {
          console.error(`Badge ${badgeName} does not exist.`);
          continue;
        }
  
        // Attempt to assign the badge using available transactions
        let badgeAssigned = false;
  
        for (const transaction of transactions) {
          // Create a unique key for the current badge and channel
          const badgeKey = `${badge.name}:${transaction.channelId || 'no_channel'}`;
  
          // Check if the badge already exists for this user on this channel
          if (existingBadgeKeySet.has(badgeKey)) {
            console.log(`Badge ${badgeName} already assigned to user ${user.id} for channel ${transaction.channelId}.`);
            continue;
          }
  
          // Assign the badge to the user, linking it to the transaction and channel
          await prisma.userBadge.create({
            data: {
              userId: user.id,
              badgeId: badge.id,
              transactionId: transaction.id,
              channelId: transaction.channelId,
            },
          });
  
          console.log(`Assigned badge ${badge.name} to user ${user.id} with transaction ${transaction.id} and channel ${transaction.channelId}`);
  
          // Add the newly assigned badge to the set to avoid re-assigning within this run
          existingBadgeKeySet.add(badgeKey);
          badgeAssigned = true;
          break; // Stop once the badge is assigned to avoid multiple assignments for the same badge and channel
        }
  
        if (!badgeAssigned) {
          console.error(`No available transaction found for badge ${badgeName} for user ${user.id}.`);
        }
      }
    } catch (e) {
      console.error('Error assigning badges to user:', e);
      console.error('User ID:', userId);
      console.error('Badge Names:', badgeNames);
      throw e;
    }
  }

  async assignTransactionsToUser(userId: string, sessionId: string): Promise<Transaction[] | null> {
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
      console.log(`No transactions found for session ${sessionId}`);
      return null;
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
      console.log(`Assigned ${transactions.length} transactions to user ${userId}`);
    } catch (e) {
      console.error('Error assigning transactions to user:', e);
      console.error('User ID:', userId);
      console.error('Session ID:', sessionId);
      throw e;
    }
    return transactions;
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
            await this.assignBadgesToUser(user.id, badges, sessionId);
            // Refresh user data to include new badges
            user = await this.getUserById(user.id);
          }

          // Delete the SessionBadge after transfer
          const sessionBadgeUpdated = await prisma.sessionBadge.findUnique({
            where: { sessionId },
          });
          if (sessionBadgeUpdated) {
            await prisma.sessionBadge.delete({
              where: { id: sessionBadge.id },
            });
          }
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

  async getAllUsers(
    options: GetAllUsersOptions = {}
  ): Promise<{ users: SerializedUser[]; totalPages: number }> {
    const { search, sort, direction, page = 1, pageSize = 10 } = options;

    // Build the 'where' clause for filtering
    const whereClause: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { username: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    // Validate sort field
    const allowedSortFields: (keyof Prisma.UserOrderByWithRelationInput)[] = [
      'name',
      'username',
      'email',
      'createdAt',
      'emailVerified',
      // Add other allowed fields here
    ];

    // Build the 'orderBy' clause for sorting
    let orderByClause: Prisma.UserOrderByWithRelationInput | undefined;
    if (sort && allowedSortFields.includes(sort as keyof Prisma.UserOrderByWithRelationInput)) {
      orderByClause = {
        [sort]: direction === 'desc' ? 'desc' : 'asc',
      };
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Fetch total count for pagination
    const totalUsers = await prisma.user.count({
      where: whereClause,
    });
    const totalPages = Math.ceil(totalUsers / pageSize);

    // Fetch users with filtering, sorting, and pagination
    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: orderByClause,
      skip,
      take,
      include: {
        badges: {
          include: {
            badge: true,
          },
        },
        _count: {
          select: {
            chats: true,
          },
        },
      },
    });

    return {
      users: users.map(this.serializeUser),
      totalPages,
    };
  }

  private serializeUser(user: any): SerializedUser {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      badges: user.badges.map((ub: any) => ub.badge.name),
      createdAt: user.createdAt.toISOString(),
      emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
      chatsCount: user._count.chats || 0,
      // Add any other fields as needed
    };
  }
}