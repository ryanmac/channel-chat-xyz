// app/api/auth/[...nextauth]/route.tsx
import { GET, POST } from "@/auth";
import config from "@/config";

console.log('Route handler environment check:');
console.log('NEXTAUTH_SECRET:', config.nextAuth.secret ? 'Set' : 'Not set');
console.log('NEXTAUTH_URL:', config.nextAuth.url ? 'Set' : 'Not set');
console.log('NEXTAUTH_URL:', config.nextAuth.url);

export { GET, POST };

// // Add this error handler
// export function middleware(request: Request) {
//   return async (error: Error) => {
//     console.error('NextAuth Error:', error);
//     console.error('Error stack:', error.stack);
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   };
// }