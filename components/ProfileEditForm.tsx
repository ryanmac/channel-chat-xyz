// components/ProfileEditForm.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/lib/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfileEditFormProps {
  user: any // Replace 'any' with a proper user type
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const [username, setUsername] = useState(user.username || "")
  const [name, setName] = useState(user.name || "")
  const [image, setImage] = useState(user.image || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await updateProfile({ username, name, image })
      router.push(`/user/@${username}`)
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred while updating your profile.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Display Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Profile Picture URL</Label>
        <Input
          id="image"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback>{name ? name[0] : 'U'}</AvatarFallback>
        </Avatar>
        <p className="text-sm text-gray-500">Current profile picture</p>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Updating..." : "Update Profile"}
      </Button>
    </form>
  )
}