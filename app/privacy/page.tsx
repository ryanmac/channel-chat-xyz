// app/privacy/page.tsx
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import ReactMarkdown from 'react-markdown'

const privacyContent = `
# ChannelChat Privacy Policy

Last Updated: [Current Date]

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

If you have any questions about this Privacy Policy, please contact us at:

ChannelChat  
[Address]  
[Email]  
[Phone number]
`;

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="space-y-4">
          <ReactMarkdown className="prose max-w-none">{privacyContent}</ReactMarkdown>
        </div>
      </main>
      <Footer />
    </div>
  )
}