import Link from 'next/link'

export function DisclaimerSection() {
  return (
    <div className="mt-8 text-center text-sm text-gray-600">
      <p>
        Disclaimer: This platform is experimental and for entertainment purposes only.{' '}
        <Link href="/about" className="text-blue-600 hover:underline">
            Learn More
        </Link>
      </p>
    </div>
  )
}