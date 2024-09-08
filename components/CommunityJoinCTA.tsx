import { Button } from "@/components/ui/button"
import { Share, MessageCircle } from "lucide-react"

export function CommunityJoinCTA() {
  return (
    <div className="mt-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
      <Button variant="outline" className="mr-4">
        <MessageCircle className="mr-2 h-4 w-4" />
        Join Our Discord
      </Button>
      <Button variant="outline">
        <Share className="mr-2 h-4 w-4" />
        Share This Channel
      </Button>
    </div>
  )
}