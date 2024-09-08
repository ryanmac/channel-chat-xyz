/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    }
}

module.exports = {
    ...nextConfig,
    async redirects() {
        return [
            {
                source: '/channel/:channelName', // Match any channel name
                has: [
                    {
                        type: 'query',
                        key: 'channelName',
                        value: '^[^@].*$', // Match only channel names that do not start with @
                    },
                ],
                destination: '/channel/@:channelName', // Redirect to the canonical URL
                permanent: true,
            },
        ];
    },
};