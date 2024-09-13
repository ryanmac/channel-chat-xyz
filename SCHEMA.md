## Schema Documentation

### Summary

The focus is on maintaining a seamless user experience, clearly distinguishing different types of contributions, and effectively using the schema's models to support both backend logic and frontend display needs.

### 1. **Account Model**

- **Purpose**: Represents a user account associated with different authentication providers (e.g., Google, Facebook).
- **Fields**:
  - `id`: Unique identifier for the account.
  - `userId`: References the `User` model to link the account to a specific user.
  - `type`: Type of account (e.g., OAuth).
  - `provider`: Name of the authentication provider (e.g., Google, Facebook).
  - `providerAccountId`: Unique identifier for the user on the provider's platform.
  - `refresh_token`, `access_token`, `expires_at`, etc.: OAuth tokens and metadata for maintaining session and access control.
- **Relationships**: 
  - Belongs to the `User` model via `userId`.
- **Frontend Needs**: Supports user authentication and session management, allowing users to log in through third-party providers.

### 2. **Session Model**

- **Purpose**: Represents a user's session for authentication and session management.
- **Fields**:
  - `id`: Unique identifier for the session.
  - `sessionToken`: Token used for identifying the session.
  - `userId`: References the `User` model to link the session to a specific user.
  - `expires`: Expiry date and time for the session.
- **Relationships**:
  - Belongs to the `User` model via `userId`.
- **Frontend Needs**: Enables maintaining user sessions, keeping users logged in across multiple requests.

### 3. **User Model**

- **Purpose**: Represents an individual user of the platform.
- **Fields**:
  - `id`: Unique identifier for the user.
  - `name`, `email`, `username`, etc.: Basic user information.
  - `role`: Enum `UserRole` to differentiate user roles (e.g., ADMIN, USER).
- **Relationships**:
  - Has many `Account`, `Chat`, `Session`, `UserBadge`, `SharedChat`, and `Transaction` records.
- **Frontend Needs**: Provides user details, authentication data, role-based access, and associated resources (like chats, badges).

### 4. **Chat Model**

- **Purpose**: Represents a chat session or conversation between a user and the system or other users.
- **Fields**:
  - `id`: Unique identifier for the chat.
  - `userId`: References the `User` model to link the chat to a specific user.
  - `channelId`: References the `Channel` model to associate the chat with a specific channel.
- **Relationships**:
  - Belongs to the `User` and `Channel` models.
  - Has many `Message` records.
- **Frontend Needs**: Supports real-time messaging and communication features, showing chat history and context.

### 5. **Message Model**

- **Purpose**: Represents individual messages exchanged in a chat.
- **Fields**:
  - `id`: Unique identifier for the message.
  - `content`: The text content of the message.
  - `type`: Enum `MessageType` to specify if the message is from a user or an AI.
- **Relationships**:
  - Belongs to the `Chat` model via `chatId`.
- **Frontend Needs**: Displays chat messages in real-time and differentiates between user and AI messages.

### 6. **Channel Model**

- **Purpose**: Represents a YouTube channel or similar entity that is integrated into the platform.
- **Fields**:
  - `id`, `name`, `title`, etc.: Basic channel details.
  - `subscriberCount`, `videoCount`, `viewCount`: Metrics to track the channel's performance.
  - `status`: Enum `ChannelStatus` to indicate the channel's state (e.g., PENDING, ACTIVE).
  - `activationFunding`, `activationGoal`: Fields to manage the funding required to activate or promote a channel.
- **Relationships**:
  - Has many `Chat`, `ChannelBoost`, `Transaction`, and `ChannelMetrics` records.
- **Frontend Needs**: Provides data for displaying channel details, performance metrics, and funding status.

### 7. **ChannelMetrics Model**

- **Purpose**: Stores historical performance metrics for channels.
- **Fields**:
  - `id`, `channelId`, `date`: Unique identifiers and references.
  - `views`, `chats`: Metrics for the number of views and chats over a specific period.
- **Relationships**:
  - Belongs to the `Channel` model via `channelId`.
- **Frontend Needs**: Supports analytics and reporting, providing trends and insights into channel performance.

### 8. **ChannelBoost Model**

- **Purpose**: Tracks boosts or enhancements applied to a channel (like memory, tokens, fine-tuning).
- **Fields**:
  - `id`, `channelId`, `boostType`: Unique identifiers and boost type details.
  - `value`: Numeric value representing the boost amount.
- **Relationships**:
  - Belongs to the `Channel` model via `channelId`.
- **Frontend Needs**: Enables channel enhancements and manages channel boost settings.

### 9. **Transaction Model**

- **Purpose**: Represents financial transactions related to users and channels.
- **Fields**:
  - `id`, `channelId`, `userId`, `sessionId`: Identifiers and references.
  - `amount`, `type`: Details of the transaction amount and its type (e.g., ACTIVATION, CREDIT_PURCHASE).
- **Relationships**:
  - Belongs to the `Channel` and `User` models.
- **Frontend Needs**: Displays transaction history, manages user and channel finances.

### 10. **Badge, SessionBadge, and UserBadge Models**

- **Badge Model**:
  - **Purpose**: Represents a type of badge that users can earn.
  - **Fields**: `id`, `name`, etc.
  - **Relationships**: Has many `UserBadge` records.

- **SessionBadge Model**:
  - **Purpose**: Represents badges earned during a session.
  - **Fields**: `id`, `sessionId`, `badges`.
  - **Relationships**: None directly defined, but logically tied to `Session`.

- **UserBadge Model**:
  - **Purpose**: Links badges to users.
  - **Fields**: `id`, `userId`, `badgeId`.
  - **Relationships**: Belongs to `User` and `Badge` models.

- **Frontend Needs**: Manages and displays user achievements, incentivizes user activity, and promotes engagement.

### 11. **SharedChat Model**

- **Purpose**: Represents shared chats or conversations that multiple users can view or participate in.
- **Fields**:
  - `id`, `title`, `content`: Identifiers and shared chat content.
  - `userId`: References the `User` who created or shared the chat.
- **Relationships**:
  - Belongs to the `User` model.
- **Frontend Needs**: Enables collaborative chats, sharing conversation threads.

### 12. **ConfigurationSetting Model**

- **Purpose**: Stores application-wide configuration settings.
- **Fields**:
  - `key`: Unique identifier for the configuration setting.
  - `value`: The actual value of the setting.
  - `description`: Optional description of what the setting controls.
- **Frontend Needs**: Allows dynamic configuration of various aspects of the application, such as credits per dollar, feature toggles, etc.

### 13. **Enums**

- **UserRole**: Defines roles within the system (e.g., ADMIN, USER).
- **MessageType**: Differentiates message types within chats (e.g., USER, AI).
- **ChannelStatus**: Tracks the state of a channel (e.g., PENDING, ACTIVE, INACTIVE).
- **ChannelBoostType**: Categorizes types of boosts applied to channels (e.g., MEMORY, TOKENS, FINE_TUNING).
- **TransactionType**: Defines types of transactions (e.g., ACTIVATION, CREDIT_PURCHASE).
- **SettingType**: Specifies data types for configuration settings (e.g., STRING, INTEGER, BOOLEAN, FLOAT).

## General Relationships

- **User to Account, Session, Badge, SharedChat, Transaction**: A user may have multiple linked accounts, active sessions, badges, shared chats, and transactions.
- **Channel to Chat, Transaction, ChannelMetrics, ChannelBoost**: Channels are central entities that interact with various other models, supporting content management, financial transactions, metrics collection, and boosts.
- **Chat to Message**: A chat can have multiple messages, facilitating communication.
- **Configuration Setting**: Provides a flexible way to store and manage various application settings.

## Context for Frontend Development

- **Authentication and User Management**: Handled by the `User`, `Account`, and `Session` models to provide secure login and role-based access control.
- **Chat Functionality**: The `Chat` and `Message` models support interactive messaging features.
- **Channel Integration and Management**: The `Channel`, `ChannelMetrics`, `ChannelBoost`, and `Transaction` models enable integration with external platforms (like YouTube) and provide tools for managing and analyzing channel performance.
- **Incentives and Gamification**: The `Badge`, `UserBadge`, and `SessionBadge` models enhance user engagement by rewarding achievements.
- **Dynamic Configurations**: The `ConfigurationSetting` model allows administrators to change application settings without redeploying code, supporting flexible and dynamic feature management.

## Requirements

1. **Track all transactions, including channel activations and credit purchases**:
   - Use the `Transaction` model to record every transaction made on the platform. Each transaction should have a `type` field (enum `TransactionType`) to differentiate between activations (`ACTIVATION`) and credit purchases (`CREDIT_PURCHASE`).
   - Ensure that the `Transaction` model records the relevant details, such as the `channelId`, `userId` (if authenticated), `sessionId` (if unauthenticated), `amount`, and `description`.

2. **Associate transactions with users, even before they're authenticated**:
   - Use a `sessionId` stored in a cookie to link unauthenticated transactions to a unique session.
   - When a user authenticates, update all `Transaction` records associated with their `sessionId` to include their `userId`, effectively linking their previous transactions to their profile.

3. **Allow viewing of user-specific channel sponsorships and badges on their profile**:
   - Create a frontend component to display a user's contributions (`Transaction` records) and earned badges (`UserBadge` and `SessionBadge` models).
   - This component should retrieve all transactions where the `userId` matches the authenticated user, grouping them by `channelId` to display contributions per channel.

4. **Provide a way to quickly retrieve all transactions for a specific channel**:
   - Use indexed fields in the `Transaction` model (`channelId`) to allow fast querying.
   - Implement API endpoints that allow the frontend to fetch all transactions for a given channel, ensuring they can be paginated or filtered based on type (activation or credit purchase).

5. **Handle the transition of transaction data from unauthenticated to authenticated users**:
   - When a user authenticates, update all `Transaction` records associated with their `sessionId` to link them to their `userId`.
   - Ensure this process also updates badges and other user-specific data.

6. **Maintain separation between activation funding and channel credits**:
   - Use separate fields in the `Channel` model (`activationFunding` for activation funding and `creditBalance` for credits) to track these amounts independently.
   - Ensure the frontend clearly distinguishes between these two types of contributions when displaying channel information or user contributions.

### Updated Terminology

1. **Activation**:
   - **Definition**: The process of activating a channel by reaching a funding goal. Activation is a one-time event, but multiple users can contribute to it.
   - **Frontend Clues**: Frontend should display an "Activate Channel" button or contribution form for channels with a `status` of `PENDING`. Progress toward activation should be shown (e.g., "$5 of $10 goal reached").

2. **Credit**:
   - **Definition**: A unit of currency used to purchase "chats" on a channel. Credits are associated with a channel but linked to user transactions. Users can earn badges for their contributions.
   - **Frontend Clues**: Display a credit balance for each channel and an option for users to purchase additional credits. Show badges earned based on credit contributions on user profiles and channel pages.

3. **Chat**:
   - **Definition**: A conversation consisting of multiple prompts and responses, limited to a maximum of 50k tokens per chat. Each chat consumes one credit. Chats range in length from 3.4k - 50k tokens.
   - **Frontend Clues**: The chat interface should keep track of token usage and inform users when they are about to reach the maximum limit per chat.

4. **Contribution** (formerly "Sponsorship"):
   - **Definition**: A user who contributes to a channel's activation or credit purchase. The term "sponsorship" or "sponsor" might still appear in some frontend components but this term is not in our schema.
   - **Frontend Clues**: Channel contributions should be listed under a user’s profile and shown on the channel page with corresponding badges.

5. **Badge**:
   - **Definition**: A visual indicator of a user's contribution to a channel. Badges are displayed on both the channel page and the user's profile.
   - **Frontend Clues**: Ensure that badges are prominently displayed in user profiles and on the channel pages. Provide hover tooltips or modals that explain the significance of each badge.

6. **Transaction**:
   - **Definition**: A record of a user's interaction involving financial contributions. Transactions are categorized into `ACTIVATION` for channel activation funding and `CREDIT_PURCHASE` for buying credits.
   - **Frontend Clues**: Show a transaction history on user profiles and channel pages, with filters for transaction types (activation vs. credit purchase). Ensure it reflects both authenticated and unauthenticated contributions.

7. **User**:
   - **Definition**: A person interacting with the system. Can be authenticated or unauthenticated. Unauthenticated users are tracked via a unique `sessionId` stored in a cookie.
   - **Frontend Clues**: Provide a seamless user experience where unauthenticated users can contribute (and later associate these contributions with their account upon authentication).

8. **Channel**:
   - **Definition**: A YouTube channel or similar entity integrated into the platform, requiring activation and ongoing credit contributions for additional features.
   - **Frontend Clues**: Each channel page should display details such as activation status, total credits, badges earned, and a list of contributors.

### Frontend Clues and Context

- **User Profiles**: Display user transactions (contributions) and earned badges prominently. Allow filtering and sorting by channel or transaction type. Provide clear indications of user roles (e.g., ADMIN vs. USER).
- **Channel Pages**: Showcase activation status and funding progress, total credits, contributors, and badges earned. Include options to contribute to activation or buy credits. Visual indicators for contributions should be clear and engaging. Active Channels should show the chat interface prominently.
- **Contribution Forms**: Simple, intuitive forms to allow unauthenticated users to contribute. Make the transition to authenticated users seamless, automatically associating prior contributions upon login.
- **Badging System**: Use badges to gamify user engagement. Include explanations and criteria for each badge. Display badges on both user profiles and channel pages.
- **Transaction History**: Implement comprehensive views and filters for transaction history, both for users and channels. Ensure quick retrieval and clear categorization of transactions.
- **Authentication**: Provide a smooth login experience with clear indications of session status. Update user-specific data upon authentication to maintain continuity in contributions and badges. Allow users to contribute and earn badges even before creating an account, linking these contributions seamlessly upon registration.
