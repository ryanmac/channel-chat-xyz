'use client'

import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import ReactMarkdown from 'react-markdown'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

const termsContent = `
# ChannelChat Terms and Conditions

Last Updated: [Current Date]

## 1. Acceptance of Terms

By accessing or using ChannelChat, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the service.

## 2. Description of Service

ChannelChat provides an AI-powered platform that allows users to interact with chatbots based on YouTube channel content.

## 3. User Accounts

3.1. You must be 13 years or older to use this service.  
3.2. You are responsible for maintaining the confidentiality of your account and password.  
3.3. You agree to accept responsibility for all activities that occur under your account.

## 4. User Conduct

Users agree not to:  
4.1. Use the service for any illegal purpose or in violation of any laws.  
4.2. Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity.  
4.3. Interfere with or disrupt the service or servers or networks connected to the service.  
4.4. Attempt to gain unauthorized access to any portion of the service or any other systems or networks connected to the service.

## 5. Content

5.1. ChannelChat does not claim ownership of the content generated through its service.  
5.2. By using the service, you grant ChannelChat a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute the content solely for the purpose of providing and improving the service.

## 6. Intellectual Property

The service and its original content, features, and functionality are owned by ChannelChat and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.

## 7. Termination

We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.

## 8. Limitation of Liability

In no event shall ChannelChat, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.

## 9. Changes to Terms

We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.

## 10. Contact Us

If you have any questions about these Terms, please contact us at [contact email].
`;

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-4xl mx-auto shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="text-3xl font-bold">Terms and Conditions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[70vh] pr-4">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-6 text-gray-800" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-700" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 text-gray-600 leading-relaxed" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 text-gray-600" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 text-gray-600" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-2" {...props} />,
                    a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                  }}
                >
                  {termsContent}
                </ReactMarkdown>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}