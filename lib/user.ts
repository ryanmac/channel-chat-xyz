// lib/user.ts
/**
 * This module contains functions for user management.
 * 
 * You need to implement the following functions:
 * - getUserByUsername(username: string): Promise<UserWithRelations | null> - Returns the user with the given username
 * - getUserById(id: string): Promise<UserWithRelations | null> - Returns the user with the given ID
 * - updateUser(id: string, data: { username?: string, name?: string, image?: string }): Promise<UserWithRelations | null> - Updates the user with the given ID
 * - isUsernameTaken(username: string, excludeUserId?: string): Promise<boolean> - Returns true if the username is already taken
 * - getUserTransactions(userId: string): Promise<Transaction[]> - Returns the transactions for the user with the given ID
 * - getUserBadges(userId: string): Promise<Badge[]> - Returns the badges for the user with the given ID
 * - getUserChats(userId: string): Promise<Chat[]> - Returns the chats for the user with the given ID
 * - getUserSharedChats(userId: string): Promise<SharedChat[]> - Returns the shared chats for the user with the given ID
 * - getUserTransactionsByType(userId: string, type: TransactionType): Promise<Transaction[]> - Returns the transactions for the user with the given ID and type 
 */
import prisma from '@/lib/prisma'
import { authConfig } from "@/auth.config"
import getServerSession from "next-auth"
import { Session } from "next-auth"
import { User, UserBadge, Badge, Chat, Channel, Transaction, TransactionType, SharedChat } from "@prisma/client"

function isSession(obj: any): obj is Session {
  return (
    obj &&
    typeof obj === "object" &&
    "user" in obj &&
    "expires" in obj
  );
}

type UserWithRelations = User & {
  badges: (UserBadge & { badge: Badge })[];
  chats: Chat[];
  sharedChats: SharedChat[];
  transactions: (Transaction & { channel: Channel })[];
};

export async function getUserByUsername(username: string): Promise<UserWithRelations | null> {
  if (!username) {
    console.log('getUserByUsername: Username is null or undefined');
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      badges: {
        include: { badge: true }
      },
      chats: true,
      sharedChats: true,
      transactions: {
        include: { channel: true }
      }
    }
  });

  if (!user) {
    console.log('User not found');
    return null;
  }

  return user;
}

export async function getUserById(id: string): Promise<UserWithRelations | null> {
  if (!id) {
    console.log('User ID is required');
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      badges: {
        include: { badge: true }
      },
      chats: true,
      sharedChats: true,
      transactions: {
        include: { channel: true }
      }
    }
  });

  if (!user) {
    console.log(`getUserById: User with ID ${id} not found`);
    return null;
  }

  return user;
}

export async function updateUser(id: string, data: { username?: string, name?: string, image?: string }): Promise<User | null> {
  if (!id) {
    console.log('User ID is required');
    return null;
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data,
  });

  console.log(`User updated: ${updatedUser.username}`);

  const sessionResult = await getServerSession(authConfig);

  if (isSession(sessionResult) && sessionResult.user.id === id) {
    console.log('Updating session user');
    sessionResult.user.username = updatedUser.username ?? undefined;
    sessionResult.user.name = updatedUser.name ?? undefined;
    sessionResult.user.image = updatedUser.image ?? undefined;
  }

  return updatedUser;
}

export async function isUsernameTaken(username: string, excludeUserId?: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      username,
      NOT: excludeUserId ? { id: excludeUserId } : undefined,
    },
  });

  return !!user;
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  return prisma.transaction.findMany({
    where: { userId },
    include: { channel: true }
  });
}

export async function getUserBadges(userId: string): Promise<Badge[]> {
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true }
  });
  return userBadges.map(ub => ub.badge);
}

export async function getUserChats(userId: string): Promise<Chat[]> {
  return prisma.chat.findMany({
    where: { userId }
  });
}

export async function getUserSharedChats(userId: string): Promise<SharedChat[]> {
  return prisma.sharedChat.findMany({
    where: { userId }
  });
}

export async function getUserTransactionsByType(userId: string, type: TransactionType): Promise<Transaction[]> {
  return prisma.transaction.findMany({
    where: { userId, type },
    include: { channel: true }
  });
}