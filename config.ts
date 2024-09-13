//config.ts
const env = process.env.NEXT_PUBLIC_ENV || 'prod';
// console.log(env);

const dev: any = {
    nextEnv: process.env.NEXT_PUBLIC_ENV || '',
    nextAuth: {
        secret: process.env.NEXTAUTH_SECRET || '',
        url: process.env.NEXTAUTH_URL || ''
    },
    app: {
        url: process.env.NEXT_PUBLIC_DEV_API_URL || ''
    },
    google: {
        clientId: process.env.DEV_GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.DEV_GOOGLE_CLIENT_SECRET || ''
    },
    db: {
        host: process.env.DEV_DB_HOST || '',
        name: process.env.DEV_DB_NAME || '',
        username: process.env.DEV_DB_USERNAME || '',
        password: process.env.DEV_DB_PASSWORD || '',
        port: process.env.PROD_DB_PORT || '',
        url: process.env.DATABASE_URL || ''
    },
    stripe: {
        secret: process.env.DEV_STRIPE_SECRET_KEY || '',
        webhook: process.env.DEV_STRIPE_WEBHOOK_SECRET || '',
        publishable: process.env.DEV_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
        apiVersion: process.env.DEV_STRIPE_API_VERSION || ''
    },
    resend: {
        apiKey: process.env.DEV_RESEND_API_KEY || ''
    },
    yes: {
        url: process.env.DEV_YOUTUBE_EXTRACTION_SERVICE_URL || '',
        apiKey: process.env.YOUTUBE_EXTRACTION_SERVICE_API_KEY || '',
    },
    youtube: {
        url: 'https://www.googleapis.com/youtube/v3/search',
        apiKey: process.env.YOUTUBE_DATA_API_KEY || ''
    }
};

const prod: any = {
    nextEnv: process.env.NEXT_PUBLIC_ENV || '',
    nextAuth: {
        secret: process.env.NEXTAUTH_SECRET || '',
        url: process.env.NEXTAUTH_URL || ''
    },
    app: {
        url: process.env.NEXT_PUBLIC_PROD_API_URL || ''
    },
    db: {
        url: process.env.DATABASE_URL || ''
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    },
    stripe: {
        secret: process.env.STRIPE_SECRET_KEY || '',
        webhook: process.env.STRIPE_WEBHOOK_SECRET || '',
        publishable: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
        apiVersion: process.env.STRIPE_API_VERSION || ''
    },
    resend: {
        apiKey: process.env.RESEND_API_KEY || ''
    },
    yes: {
        url: process.env.YOUTUBE_EXTRACTION_SERVICE_URL || '',
        apiKey: process.env.YOUTUBE_EXTRACTION_SERVICE_API_KEY || '',
    },
    youtube: {
        url: 'https://www.googleapis.com/youtube/v3/search',
        apiKey: process.env.YOUTUBE_DATA_API_KEY || ''
    }
};

const config: any = {
    dev,
    prod
};

export default config[env];