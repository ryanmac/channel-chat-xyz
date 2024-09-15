// routes.tsx

/**
 * An array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
    "/",
    "/signup",
    "/auth/new-verification",
    "/about",
    "/feedback",
    "/privacy",
    "/public",
    "/terms",
    "/user/[username]",
    "/channel/[channelName]",
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = [
    "/auth/login",
    "/auth/reset",
    "/auth/new-password"
];

/**
 * An array of routes that require admin access
 * These routes will redirect non-admin users to the home page
 * @type {string[]}
 */
export const adminRoutes = [
    "/admin",
    "/api/admin/boost",
];

/**
 * An array of API routes that do not require authentication
 * @type {string[]}
 */
export const publicApiRoutes = [
    "/api/auth/callback/google",
    "/api/auth/user",
    "/api/chat",
    "/api/channel/funding",
    "/api/channel/leaderboard",
    "/api/bot/info",
    "/api/create-checkout-session",
    "/api/featured-channels",
    "/api/community-support",
    "/api/fuel/add",
    "/api/fuel/info",
    "/api/badges/session",
    "/api/badges/transfer",
    "/api/transactions",
    "/api/webhook/stripe",
    "/api/yes/channel-info",
    "/api/yes/process-channel",
];

/**
 * The prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/";