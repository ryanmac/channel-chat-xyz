// lib/user.ts
import prisma from '@/lib/prisma'
import { authConfig } from "@/auth.config"
import getServerSession from "next-auth"
import { Session } from "next-auth"

function isSession(obj: any): obj is Session {
  return (
    obj &&
    typeof obj === "object" &&
    "user" in obj &&
    "expires" in obj
  );
}

export async function getUserByUsername(username: string) {
  if (!username) {
    console.log('getUserByUsername: Username is null or undefined');
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      sponsorships: {
        include: { channel: true }
      },
      badges: true,
      chats: true,
    }
  });

  if (!user) {
    console.log('User not found');
    return null;
  }

  // Calculate statistics
  const sponsoredChatsCount = user.sponsorships.length;
  const participatedChatsCount = user.chats.length;

  return {
    ...user,
    username: user.username ?? '',
    image: user.image ?? undefined,
    name: user.name ?? null,
    sponsoredChatsCount,
    participatedChatsCount,
  };
}

export async function getUserById(id: string) {
  if (!id) {
    console.log('User ID is required');
    return null;
  }
  
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      sponsorships: {
        include: { channel: true }
      },
      badges: true,
      chats: true,
    }
  });

  if (!user) {
    console.log(`getUserById: User with ID ${id} not found`);
    return null;
  }

  const sponsoredChatsCount = user.sponsorships.length;
  const participatedChatsCount = user.chats.length;

  return {
    ...user,
    sponsoredChatsCount,
    participatedChatsCount,
    username: user.username ?? undefined,
    name: user.name ?? undefined,
    image: user.image ?? undefined,
  };
}

export async function updateUser(id: string, data: { username?: string, name?: string, image?: string }) {
  if (!id) {
    console.log('User ID is required');
    return null;
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data,
  });

  console.log(`User updated: ${updatedUser.username}`);
  console.log(updatedUser);

  const sessionResult = await getServerSession(authConfig);

  if (isSession(sessionResult) && sessionResult.user.id === id) {
    console.log('Updating session user');
    sessionResult.user.username = updatedUser.username ?? undefined;
    sessionResult.user.name = updatedUser.name ?? undefined;
    sessionResult.user.image = updatedUser.image ?? undefined;
    console.log(sessionResult.user);
  }

  return updatedUser;
}

export async function isUsernameTaken(username: string, excludeUserId?: string) {
  const user = await prisma.user.findFirst({
    where: {
      username,
      NOT: excludeUserId ? { id: excludeUserId } : undefined,
    },
  });

  return !!user;
}