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
    "/channel",
    "/about",
    "/feedback",
    "/privacy",
    "/public",
    "/terms",
    "/user/[username]",
    "/api/admin/boost",
    "/api/auth/callback/google",
    "/api/auth/user",
    "/api/chat",
    "/api/channel/funding",
    "/api/bot/info",
    "/api/create-checkout-session",
    "/api/fuel/add",
    "/api/fuel/info",
    "/api/badges/session",
    "/api/badges/transfer",
    "/api/webhook/stripe",
    "/api/yes/channel-info",
    "/api/yes/process-channel/",
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = [
    "/auth/login",
    "/api/user",
    "/auth/reset",
    "/auth/new-password"
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