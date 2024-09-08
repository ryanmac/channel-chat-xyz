# ChannelChat.io

## Overview

**ChannelChat.io** is a community-driven platform that transforms YouTube channels into interactive, AI-powered chatbots. This application allows users to "chat" with a YouTube channel using an advanced Retrieval-Augmented Generation (RAG) technique and a Large Language Model (LLM). The platform engages audiences, encourages sponsorships, and fosters deeper creator-viewer relationships.

### Key Features

- **Interactive Chat Interface**: Engage with YouTube channels via an AI chatbot.
- **Crypto Payments**: Users can sponsor channels and buy credits using crypto wallets.
- **Traditional Payments**: Supports Stripe for credit card payments.
- **User-Friendly Authentication**: Uses NextAuth.js for social logins and secure access.
- **Community Features**: Allows sharing and highlighting of community-driven conversations.
- **Admin Tools**: Comprehensive admin dashboard for managing users, content, and analytics.
- **Accessible and Responsive Design**: Uses ShadCN components and Tailwind CSS for a consistent and accessible UI.

## Core Features

The core features of ChannelChat.io, to be developed across multiple phases, include:

- **Phase 1: Initial Launch**
  - AI-Powered Chatbot: Engage directly with YouTube channels via a chatbot.
  - Basic Sponsor Channels: Use traditional payment methods to support channels.

- **Phase 2: Enhanced Interactions and Community Features**
  - Community Engagement: Share and highlight popular chats, and track sponsorships and contributions.

- **Phase 3: Monetization and Admin Tools**
  - Admin Controls: Manage users, moderate content, and view platform analytics.
  - Additional Sponsorship Options: Use crypto wallets for sponsorships and donations.

- **Phase 4 and Beyond: Full Feature Set**
  - Responsive UI: Built with ShadCN and Tailwind CSS for a seamless user experience on any device.
  - Additional features as specified in the SCOPE document.

## Table of Contents

- [ChannelChat.io](#channelchatio)
  - [Overview](#overview)
    - [Key Features](#key-features)
  - [Core Features](#core-features)
  - [Table of Contents](#table-of-contents)
  - [Project Purpose](#project-purpose)
  - [Installation and Setup](#installation-and-setup)
    - [Running the Application](#running-the-application)
  - [Configuration](#configuration)
    - [NextAuth.js](#nextauthjs)
    - [Crypto Payments](#crypto-payments)
    - [Traditional Payments](#traditional-payments)
    - [Email Sending](#email-sending)
  - [Testing](#testing)
    - [Run Unit and Integration Tests](#run-unit-and-integration-tests)
    - [Run End-to-End (E2E) Tests](#run-end-to-end-e2e-tests)
    - [Testing Features](#testing-features)
  - [Contributing](#contributing)
  - [Core Features](#core-features-1)
  - [Project Structure](#project-structure)
  - [License](#license)

## Project Purpose

**ChannelChat.io** aims to create a unique and engaging experience where YouTube audiences can interact directly with channel content via chatbots. It encourages community involvement through sponsorships and shares, benefiting both content creators and their fans.

## Installation and Setup

Follow these instructions to set up the development environment and run the application locally.

1. Clone the Repository
    ```bash
    git clone https://github.com/ryanmac/ChannelChat.io.git
    cd ChannelChat.io
    ```

2. Install Dependencies
    ```bash
    npm install
    ```

3. Set up Supabase:
    - Create a Supabase project at [https://supabase.com](https://supabase.com).
    - Obtain your Supabase `URL` and `API Key` from the project settings.

4. Configure environment variables:
    - Create a `.env` file in the root directory of the project and fill it with your environment-specific variables. You can use the `.env.example` as a reference:
    ```plaintext
    NEXT_PUBLIC_API_URL=http://localhost:3000/api
    DATABASE_URL=mysql://user:password@localhost:3306/channelchat
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your-nextauth-secret
    STRIPE_SECRET_KEY=your-stripe-secret
    RESEND_API_KEY=your-resend-api-key
    RAINBOWKIT_API_KEY=your-rainbowkit-api-key
    SUPABASE_URL=your-supabase-url
    SUPABASE_KEY=your-supabase-key
    ```

5. Run the application:
    ```sh
    npm run dev
    ```

Ensure you have [Node.js](https://nodejs.org/) installed before running these commands.

### Running the Application

To start the development server, run:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Configuration

### NextAuth.js

NextAuth.js is configured for secure user authentication, supporting multiple providers:

- **Email Login**: Default option with email verification.
- **OAuth Providers**: Google, GitHub, etc. configured via `.env`.
  
Adjust the configuration in `/next-auth/[...nextauth].js` for additional providers.

### Crypto Payments

**RainbowKit** is integrated to support crypto payments. Ensure your `.env` file contains the necessary keys and secrets. Refer to the documentation for wallet support and configurations.

### Traditional Payments

**Stripe** is used to handle traditional payments. Make sure your Stripe account is set up and API keys are added to the `.env` file.

### Email Sending

**Resend** is used for email communications. Configure your Resend API key in the `.env` file.

## Testing

### Run Unit and Integration Tests

To run the test suite:

```bash
npm run test
```

### Run End-to-End (E2E) Tests

Ensure that the server is running and then execute:

```bash
npm run test:e2e
```

### Testing Features

- **Authentication**: Verify that user registration, login, and social login options are functioning.
- **Crypto Payments**: Ensure the wallet connection and payment processing are working smoothly.
- **Stripe Payments**: Test credit card payment flows for purchasing credits and sponsoring channels.
- **Chat Interface**: Confirm that users can engage with the AI chatbot, and the chat history is preserved.
- **Admin Dashboard**: Check that admin functionalities like user management, content moderation, and analytics are operational.

## Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch-name`).
3. Commit your changes (`git commit -m 'Add a new feature'`).
4. Push the branch (`git push origin feature-branch-name`).
5. Open a Pull Request.

Please read `CONTRIBUTING.md` for more details on our code of conduct, and the process for submitting pull requests.

## Core Features

The core features of ChannelChat.io include:

- **AI-Powered Chatbot**: Engage directly with YouTube channels via a chatbot.
- **Sponsor Channels**: Use crypto wallets or traditional payment methods to sponsor and support channels.
- **Community Engagement**: Share and highlight popular chats, and track sponsorships and contributions.
- **Admin Controls**: Manage users, moderate content, and view platform analytics.
- **Responsive UI**: Built with ShadCN and Tailwind CSS for a seamless user experience on any device.

## Project Structure

```shell
.
├── README.md                       # Project readme file
├── .env.example                    # Environment variable example
├── .vscode                         # VSCode configuration for Debugging in local
├── CONTRIBUTING.md                 # Steps to follow to contribute to project
├── app                             # Next JS App (App Router)
│   └── api                         # API functions and routes
├── components                      # React components
│   └── internal                    # Internal Build Components
│   └── ui                          # Shadcn UI Components
├── controllers                     # Handles Database Queries
├── data                            # Class Objects of data
├── helpers                         # Helper Classes - Repetitive Functions
├── libs                            # 3rd party libraries configuration
├── next-auth                       # Next Auth Configuration
├── prisma                          # Prisma Configuration
├── public                          # Public assets folder
├── redux                           # Redux Store
├── utils                           # Utility Function Class
├── middleware.ts                   # Middleware Functionality code
├── tailwind.config.js              # Tailwind CSS configuration
└── tsconfig.json                   # TypeScript configuration
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
