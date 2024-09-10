import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { FeedbackForm } from "@/components/FeedbackForm"

export default function FeedbackPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <FeedbackForm />
      <Footer />
    </div>
  )
}