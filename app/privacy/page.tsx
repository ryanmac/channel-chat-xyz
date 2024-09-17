// app/privacy/page.tsx
'use client'

import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import ReactMarkdown from 'react-markdown'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

const privacyContent = `
Last Updated: September 1, 2024

At ChannelChat, we are committed to protecting your privacy and ensuring you have a positive experience on our platform. This policy outlines our data collection and use practices.

## 1. Information We Collect

### 1.1 Information you provide to us:
- Account information (e.g., name, email address, password)
- Profile information (e.g., profile picture, bio)
- Payment information (processed securely through our payment providers)
- Content you create, share, or interact with on our platform

### 1.2 Information we collect automatically:
- Usage data (e.g., features used, time spent on the platform)
- Device information (e.g., IP address, browser type, operating system)
- Cookies and similar tracking technologies

## 2. How We Use Your Information

We use your information to:
- Provide, maintain, and improve our services
- Process transactions and send related information
- Send you technical notices, updates, security alerts, and support messages
- Respond to your comments, questions, and customer service requests
- Monitor and analyze trends, usage, and activities in connection with our services
- Personalize and improve your experience on our platform

## 3. Information Sharing and Disclosure

We may share your information:
- With third-party service providers who perform services on our behalf
- To comply with legal obligations
- In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business
- With your consent or at your direction

## 4. Data Retention

We retain your information for as long as your account is active or as needed to provide you services, comply with our legal obligations, resolve disputes, and enforce our agreements.

## 5. Your Rights and Choices

Depending on your location, you may have certain rights regarding your personal information, including:
- Accessing, correcting, or deleting your personal information
- Objecting to or restricting certain processing of your data
- Data portability

To exercise these rights, please contact us using the information provided at the end of this policy.

## 6. Children's Privacy

Our service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information.

## 7. Changes to This Policy

We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date.

## 8. Security

We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.

## 9. International Data Transfers

Your information may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.

## 10. Contact Us

If you have any questions about this Privacy Policy, please contact us on X:

[@ChannelChatXYZ](https://x.com/@ChannelChatXYZ)
`;

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-300">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-4xl mx-auto shadow-xl text-gray-800 dark:text-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[70vh] pr-4">
                <ReactMarkdown
                  className="custom-prose"
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-6" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-8 mb-4" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-2" {...props} />,
                    a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                  }}
                >
                  {privacyContent}
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