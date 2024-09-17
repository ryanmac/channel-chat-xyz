import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="py-6 mt-12 bg-background text-gray-600 dark:bg-background dark:text-gray-600">
      <div className="container mx-auto px-8 flex justify-between items-center">
        {/* <Button variant="outline">Tip the Dev</Button> */}
        <div className="space-x-4 mx-auto">
          <a href="/about" className="hover:text-gray-500">About Us</a>
          <a href="/feedback" className="hover:text-gray-500 pl-8">Feedback</a>
          <a href="/privacy" className="hover:text-gray-500 pl-8">Privacy Policy</a>
          <a href="/terms" className="hover:text-gray-500 pl-8">Terms of Service</a>
        </div>
      </div>
    </footer>
  )
}