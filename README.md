# ChannelChat.xyz

ChannelChat.xyz is a cutting-edge platform that transforms YouTube channels into interactive, AI-powered chatbots. Our application allows users to engage in dynamic conversations with their favorite YouTube content through advanced Retrieval-Augmented Generation (RAG) and Large Language Model (LLM) techniques.

## Key Features

- **AI-Powered Chat Interface**: Engage with YouTube channels via sophisticated chatbots.
- **Multi-Channel Support**: Chat with multiple YouTube channels simultaneously.
- **Sponsorship System**: Support creators through crypto and traditional payment methods.
- **Community Engagement**: Share and highlight popular conversations.
- **User Authentication**: Secure login with social and email options.
- **Admin Dashboard**: Comprehensive tools for user management and content moderation.
- **Responsive Design**: Seamless experience across all devices.

## Technology Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM with PostgreSQL on Supabase
- **Authentication**: NextAuth.js
- **Payments**: Stripe (traditional), RainbowKit (crypto)
- **AI Integration**: Custom RAG implementation with LLM
- **Email**: Resend for transactional emails
- **Deployment**: Vercel

## Project Structure

```
.
├── app/                # Next.js 13 app directory
│   ├── api/            # API routes
│   ├── (main)/         # Main application routes
│   └── ...             # Other app routes
├── components/         # React components
├── lib/                # Utility libraries and configurations
├── prisma/             # Prisma schema and migrations
├── public/             # Static assets
├── styles/             # Global styles
├── utils/              # Utility functions
└── ...                 # Configuration files
```

## Core Components

- **ChatInterface**: The main chat UI for interacting with channel chatbots.
- **ChannelHeader**: Displays channel information and metrics.
- **SponsorshipCTA**: Call-to-action for channel sponsorships.
- **LeaderboardActivity**: Shows top sponsors and recent activities.
- **AdminDashboard**: Interface for platform management and analytics.

## Getting Started

For detailed setup instructions, including local development setup, test deployment, and production deployment, please refer to our [SETUP.md](SETUP.md) file.

## Contributing

We welcome contributions from the community! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to submit pull requests, report issues, and suggest improvements.

## License

ChannelChat.xyz is open-source software licensed under the MIT license. See the [LICENSE](LICENSE) file for more details.

## Support

If you encounter any issues or have questions, please file an issue on our GitHub repository or contact our support team at support@channelchat.xyz.

---

ChannelChat.xyz - Bringing AI-powered conversations to your favorite YouTube channels!