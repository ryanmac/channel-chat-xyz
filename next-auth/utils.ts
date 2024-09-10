// next-auth/utils.ts
import {auth} from "@/auth"

// export type AuthSession = {
//   session: {
//     user: {
//       id: string;
//       name?: string;
//       email?: string;
//       image?: string;
//     };
//   } | null;
// };

export const getCurrentUser = async () => {
    const session = await auth();
    console.log('getCurrentUser session:', session);
    return session;
};
