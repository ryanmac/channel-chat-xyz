// lib/actions.ts
"use server"

import { auth } from "@/auth"
import { updateUser, isUsernameTaken, generateUniqueUsername } from "@/lib/user"
import { revalidatePath } from "next/cache"

interface UpdateProfileData {
  username: string
  name: string
  image: string
}

export async function updateProfile(data: UpdateProfileData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("You must be logged in to update your profile")
  }

  // Check if the username is changed and if it's taken
  if (data.username !== session.user.name) {
    const isTaken = await isUsernameTaken(data.username, session.user.id)
    if (isTaken) {
      // Generate a unique username if the requested one is taken
      data.username = await generateUniqueUsername(data.username)
    }
  }

  // Update the user profile
  await updateUser(session.user.id, data)

  // Revalidate the user profile page
  revalidatePath(`/user/@${data.username}`)
}