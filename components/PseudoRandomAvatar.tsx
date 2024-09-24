"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

// Types for the PseudoRandomAvatar component
interface PseudoRandomAvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  seed: string
  size?: number
}

// Main component definition
const PseudoRandomAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  PseudoRandomAvatarProps
>(({ className, seed, size = 100, ...props }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Seeded random number generator
    const prng = new Alea(seed).next

    // Clear the canvas and fill with a base color
    ctx.clearRect(0, 0, size, size)
    ctx.fillStyle = getRandomColor(prng)
    ctx.fillRect(0, 0, size, size)

    // Generate random shapes
    const numShapes = 3 + Math.floor(prng() * 5)
    for (let i = 0; i < numShapes; i++) {
      drawRandomShape(ctx, prng, size)
    }
  }, [seed, size])

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <canvas ref={canvasRef} width={size} height={size} className="rounded-full" />
    </AvatarPrimitive.Root>
  )
})
PseudoRandomAvatar.displayName = AvatarPrimitive.Root.displayName

// Type definitions for the Alea class
interface Alea {
  next: () => number
}

// Alea PRNG implementation with a constructor
class Alea {
  private s0: number
  private s1: number
  private s2: number
  private c: number

  constructor(seed: string) {
    const mash = Mash()
    this.c = 1
    this.s0 = mash(' ')
    this.s1 = mash(' ')
    this.s2 = mash(' ')
    this.s0 -= mash(seed)
    if (this.s0 < 0) this.s0 += 1
    this.s1 -= mash(seed)
    if (this.s1 < 0) this.s1 += 1
    this.s2 -= mash(seed)
    if (this.s2 < 0) this.s2 += 1
  }

  next = () => {
    const t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10
    this.s0 = this.s1
    this.s1 = this.s2
    this.s2 = t - (this.c = t | 0)
    return this.s2
  }
}

// Mash function used in Alea to initialize the random state
function Mash() {
  let n = 0xefc8249d
  const mash = (data: string) => {
    for (let i = 0; i < data.length; i++) {
      n += data.charCodeAt(i)
      const h = 0.02519603282416938 * n
      n = h >>> 0
      n += h * 0x100000000
    }
    return (n >>> 0) * 2.3283064365386963e-10
  }
  return mash
}

// Function to generate a random color
function getRandomColor(random: () => number): string {
  const h = Math.floor(random() * 360)
  const s = 70 + Math.floor(random() * 30)
  const l = 40 + Math.floor(random() * 20)
  return `hsl(${h}, ${s}%, ${l}%)`
}

// Function to draw a random shape on the canvas
function drawRandomShape(ctx: CanvasRenderingContext2D, random: () => number, size: number) {
  ctx.fillStyle = getRandomColor(random)
  ctx.beginPath()

  const points = 3 + Math.floor(random() * 5)
  const centerX = random() * size
  const centerY = random() * size
  const radius = size * (0.1 + random() * 0.3)

  for (let j = 0; j < points; j++) {
    const angle = (j / points) * Math.PI * 2
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    if (j === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }

  ctx.closePath()
  ctx.fill()
}

export { PseudoRandomAvatar }