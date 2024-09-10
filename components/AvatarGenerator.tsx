// components/AvatarGenerator.tsx
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Simple hash function to generate a pseudo-random number from a string
const hashCode = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Generate a color based on the hash
const generateColor = (hash: number, index: number) => {
  const hue = (hash + index * 50) % 360
  return `hsl(${hue}, 70%, 60%)`
}

// Generate random SVG pattern based on the username hash
const generateSVGPattern = (username: string) => {
  const hash = hashCode(username)
  const colors = [
    generateColor(hash, 0),
    generateColor(hash, 1),
    generateColor(hash, 2),
  ]

  // Use the hash to determine shapes, sizes, and positions
  const shapeType = hash % 3 // 0: Circle, 1: Rect, 2: Path
  const size = (hash % 20) + 30 // Shape size between 30 and 50
  const cx = (hash % 50) + 25 // Circle X position
  const cy = (hash % 50) + 25 // Circle Y position
  const rotation = hash % 360 // Path rotation

  const shapeSVG = shapeType === 0 ? 
    `<circle cx="${cx}" cy="${cy}" r="${size}" fill="${colors[1]}" />` :
    shapeType === 1 ?
    `<rect x="${cx - size / 2}" y="${cy - size / 2}" width="${size}" height="${size}" fill="${colors[1]}" />` :
    `<path d="M${cx} ${cy} L${cx + size} ${cy + size} L${cx - size} ${cy + size} Z" fill="${colors[1]}" transform="rotate(${rotation} 50 50)" />`

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${colors[0]}" />
      ${shapeSVG}
      <circle cx="75" cy="25" r="10" fill="${colors[2]}" />
    </svg>
  `
}

interface AvatarGeneratorProps {
  username: string
  imageUrl?: string
  size?: number
}

export default function AvatarGenerator({ username, imageUrl, size = 40 }: AvatarGeneratorProps) {
  const svgPattern = generateSVGPattern(username)
  const fallbackInitials = username.slice(0, 2).toUpperCase()

  return (
    <Avatar style={{ width: size, height: size }}>
      <AvatarImage src={imageUrl} alt={username} />
      <AvatarFallback>
        {imageUrl ? (
          fallbackInitials
        ) : (
          <div
            style={{ width: '100%', height: '100%' }}
            dangerouslySetInnerHTML={{ __html: svgPattern }}
          />
        )}
      </AvatarFallback>
    </Avatar>
  )
}