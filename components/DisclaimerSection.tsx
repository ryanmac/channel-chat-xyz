import Link from 'next/link'

export function DisclaimerSection() {
  return (
    <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
      <p>
        Disclaimer: ChannelChat is experimental and for entertainment purposes only.{' '}
        <Link href="/about" className="text-blue-600 dark:text-blue-400 hover:underline">
            Learn More
        </Link>
      </p>
    </div>
  )
}