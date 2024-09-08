# ChannelChat.xyz Setup Guide

This guide will walk you through setting up ChannelChat.xyz for local development, test deployment, and production deployment on Vercel.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or later)
- npm (v6 or later)
- Git
- PostgreSQL (v13 or later)

You'll also need accounts on the following services:
- [Vercel](https://vercel.com)
- [Supabase](https://supabase.com)
- [Stripe](https://stripe.com)
- [Resend](https://resend.com)
- [RainbowKit](https://www.rainbowkit.com)

## Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ChannelChat.xyz.git
   cd ChannelChat.xyz
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your local environment variables:
   - Copy the `.env.example` file to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Open `.env.local` and fill in the required values (see Environment Configuration section below)

4. Set up the database:
   - Create a new PostgreSQL database for the project
   - Update the `DATABASE_URL` in your `.env.local` file with your database connection string

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

## Environment Configuration

Update your `.env.local` file with the following variables:

```plaintext
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=postgresql://user:password@localhost:5432/channelchat
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID=your-rainbowkit-project-id
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
OPENAI_API_KEY=your-openai-api-key
YOUTUBE_API_KEY=your-youtube-api-key
```

Replace `your-*` placeholders with your actual API keys and secrets.

## Third-Party Service Configuration

### Supabase
1. Create a new project on Supabase
2. Get your project URL and API key from the project settings
3. Update `SUPABASE_URL` and `SUPABASE_KEY` in your `.env.local` file

### Stripe
1. Create a Stripe account and navigate to the Developers section
2. Get your API keys (test mode for development)
3. Update `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in your `.env.local` file

### Resend
1. Sign up for a Resend account
2. Create an API key
3. Update `RESEND_API_KEY` in your `.env.local` file

### RainbowKit
1. Create a new project on RainbowKit
2. Get your project ID
3. Update `NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID` in your `.env.local` file

### OpenAI (for AI features)
1. Sign up for an OpenAI account
2. Create an API key
3. Update `OPENAI_API_KEY` in your `.env.local` file

### YouTube API
1. Set up a project in the Google Developers Console
2. Enable the YouTube Data API v3
3. Create API credentials and get your API key
4. Update `YOUTUBE_API_KEY` in your `.env.local` file

## Running the Application Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Test Deployment to Vercel

1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to a test environment:
   ```bash
   vercel
   ```

4. Follow the prompts to link your project and deploy

5. Once deployed, Vercel will provide you with a URL for your test deployment

## Production Deployment on Vercel

1. Ensure all your changes are committed and pushed to your main branch

2. Deploy to production:
   ```bash
   vercel --prod
   ```

3. Vercel will build and deploy your application to production

4. Set up your environment variables in the Vercel dashboard:
   - Go to your project settings
   - Navigate to the "Environment Variables" section
   - Add all the variables from your `.env.local` file

5. (Optional) Set up a custom domain in the Vercel dashboard

## Troubleshooting Common Issues

- **Database Connection Issues**: Ensure your `DATABASE_URL` is correct and that your database server is running
- **API Key Errors**: Double-check that all your API keys in the `.env.local` file are correct and up to date
- **Build Errors on Vercel**: Check the build logs in the Vercel dashboard for specific error messages. Ensure all dependencies are correctly listed in your `package.json`
- **NextAuth Errors**: Verify that your `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are correctly set
- **Stripe Webhook Errors**: Ensure your Stripe webhook is correctly set up and that the `STRIPE_WEBHOOK_SECRET` is correct

For more specific issues, please refer to our project documentation or file an issue on our GitHub repository.