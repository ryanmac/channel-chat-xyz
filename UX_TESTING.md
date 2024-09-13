### **Channel Page Testing:**

#### **Preparation:**

1. **Delete all User & UserBadge records**
   - Action: Execute a script or SQL query to delete all records from `User` and `UserBadge` tables.
   - Expected Result: The tables `User` and `UserBadge` should be empty.
   
2. **Sign Out of any current sessions**
   - Action: Manually sign out or run a script to invalidate all active sessions.
   - Expected Result: The user is signed out, and there are no active sessions.

3. **Clear site data**
   - Action: Clear cookies, local storage, and cache data for the site.
   - Expected Result: No residual data from previous sessions remains in the browser.

4. **Hard Refresh**
   - Action: Perform a hard refresh (Ctrl+F5 or Command+Shift+R).
   - Expected Result: The browser reloads the page and fetches all resources afresh from the server.

#### **Test Sequence:**

1. **Load Channel Page (without any activation funding to date)**
   - Action: Navigate to the channel page URL.
   - Expected Result: The page loads successfully, showing an initial state with $0/$10 progress toward activation.

2. **Contribute $1 via Stripe Checkout**
   - Action: Click the “Contribute” button and complete the payment flow via Stripe Checkout.
   - Expected Result: The payment is successfully processed, and the page reloads or updates to reflect the contribution.

3. **Assert Channel Page Shows $1/$10 Progress Toward Activation**
   - Action: Verify that the page displays the updated funding progress.
   - Assertion: The funding progress bar or text should indicate "$1/$10".

4. **Assert `SuccessShareModal` Displays and Is Functional, Including Any Badges Earned**
   - Action: Trigger any post-contribution actions that would cause the `SuccessShareModal` to display.
   - Assertion: The modal should appear, show the correct information, and have functional share buttons and badges.

5. **Assert `SignInModal` Displays and Is Functional, Including Badges**
   - Action: Ensure that the `SignInModal` appears if the user is not signed in.
   - Assertion: The modal should display correctly and contain any relevant badges. Sign-in functionality should work without errors.

6. **Sign In via Google OAuth**
   - Action: Click on the "Sign in with Google" button in the `SignInModal` and complete the Google OAuth flow.
   - Expected Result: The user is successfully signed in, and the page reflects the logged-in state.

7. **Assert Supabase Shows New User Record, Including Generated Username**
   - Action: Query Supabase to check for the new user record.
   - Assertion: A new user record exists with a valid username.

8. **Assert Browser Shows User Profile Pic in the Header**
   - Action: Inspect the browser UI after signing in.
   - Assertion: The user profile picture should be visible in the header.

9. **Assert Badges Are Assigned to User in Supabase**
   - Action: Query the `UserBadge` table in Supabase.
   - Assertion: The user's badges should match the ones displayed in the `SuccessShareModal`.

10. **Assert Recent Transactions Are Assigned to User in Supabase**
    - Action: Query the `Transactions` table in Supabase.
    - Assertion: The transaction for the $1 contribution should be linked to the user record.

11. **Visit User Profile Page (/user/[username]) and Confirm Functional Components**
    - Action: Navigate to the user profile page using the generated username.
    - Assertions:
      - **Profile Details**: Correct user details (username, profile pic, badges) are displayed.
      - **Badge Display**: All earned badges are displayed and match Supabase records.
      - **Transaction History**: Recent transactions are visible and accurate.
      - **Navigation**: All navigation links and actions (e.g., Edit Profile, Logout) are functional.
