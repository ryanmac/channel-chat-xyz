// lib/user.ts
import prisma from '@/lib/prisma'

export async function getUserByUsername(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      sponsorships: {
        include: { channel: true }
      },
      // Assuming we've added these relations to the User model
      badges: true,
      chats: true,
    }
  })

  if (!user) return null

  // Calculate statistics
  const sponsoredChatsCount = user.sponsorships.length
  const participatedChatsCount = user.chats.length

  return {
    ...user,
    sponsoredChatsCount,
    participatedChatsCount,
  }
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      sponsorships: {
        include: { channel: true }
      },
      badges: true,
      chats: true,
    }
  })

  if (!user) return null

  const sponsoredChatsCount = user.sponsorships.length
  const participatedChatsCount = user.chats.length

  return {
    ...user,
    sponsoredChatsCount,
    participatedChatsCount,
  }
}

export async function updateUser(id: string, data: { username?: string, name?: string, image?: string }) {
  const updatedUser = await prisma.user.update({
    where: { id },
    data,
  })

  return updatedUser
}

export async function isUsernameTaken(username: string, excludeUserId?: string) {
  const user = await prisma.user.findFirst({
    where: {
      username,
      NOT: excludeUserId ? { id: excludeUserId } : undefined,
    },
  })

  return !!user
}

export async function generateUniqueUsername(baseUsername: string) {
  let username = baseUsername
  let suffix = 1

  while (await isUsernameTaken(username)) {
    username = `${baseUsername}-${getRandomWord()}`
    if (await isUsernameTaken(username)) {
      username = `${baseUsername}-${suffix}`
      suffix++
    }
  }

  return username
}

const randomWords = [
  "alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel",
  "india", "juliet", "kilo", "lima", "mike", "november", "oscar", "papa",
  "quebec", "romeo", "sierra", "tango", "uniform", "victor", "whiskey",
  "xray", "yankee", "zulu"
]

function getRandomWord() {
  return randomWords[Math.floor(Math.random() * randomWords.length)]
}