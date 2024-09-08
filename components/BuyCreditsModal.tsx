'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function BuyCreditsModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Buy Credits</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buy Credits</DialogTitle>
          <DialogDescription>
            Purchase credits to sponsor channels and support the community. 1000 credits = $5
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="credits" className="text-right">
              Credits
            </Label>
            <Input
              id="credits"
              defaultValue="1000"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount ($)
            </Label>
            <Input
              id="amount"
              defaultValue="5"
              className="col-span-3"
              readOnly
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Purchase Credits</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}