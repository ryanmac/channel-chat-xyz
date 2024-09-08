// app/api/auth/[...nextauth]/route.tsx
import { GET, POST } from "@/auth";

console.log('Route handler environment check:');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? 'Set' : 'Not set');

export { GET, POST };