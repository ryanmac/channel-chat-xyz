import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="py-6 mt-12">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Button variant="outline">Tip the Dev</Button>
        <div className="space-x-4">
          <a href="/about" className="text-gray-600 hover:text-gray-900">About Us</a>
          <a href="/feedback" className="text-gray-600 hover:text-gray-900">Feedback</a>
          <a href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</a>
          <a href="/terms" className="text-gray-600 hover:text-gray-900">Terms of Service</a>
        </div>
      </div>
    </footer>
  )
}