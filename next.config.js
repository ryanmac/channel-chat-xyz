// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
  async redirects() {
    return [
      {
        source: '/channel/:channelName',
        has: [
          {
            type: 'query',
            key: 'channelName',
            value: '^[^@].*$',
          },
        ],
        destination: '/channel/@:channelName',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;