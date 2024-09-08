'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

export function FeedbackForm() {
  return (
    <form className="space-y-8 max-w-md mx-auto">
      <div className="space-y-2">
        <Label htmlFor="name">Name (optional)</Label>
        <Input id="name" placeholder="Your name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input id="email" type="email" placeholder="Your email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="feedback-type">Feedback Type</Label>
        <RadioGroup defaultValue="bug">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bug" id="bug" />
            <Label htmlFor="bug">Bug Report</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="feature" id="feature" />
            <Label htmlFor="feature">Feature Suggestion</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="general" id="general" />
            <Label htmlFor="general">General Comment</Label>
          </div>
        </RadioGroup>
      </div>
      <div className="space-y-2">
        <Label htmlFor="feedback">Your Feedback</Label>
        <Textarea id="feedback" placeholder="Please provide your feedback here" required />
      </div>
      <Button type="submit" className="w-full">Submit Feedback</Button>
    </form>
  )
}