// app/api/auth/[...nextauth]/route.tsx
import { GET, POST } from "@/auth";
import config from "@/config";

console.log('Route handler environment check:');
console.log('NEXTAUTH_SECRET:', config.nextAuth.secret ? 'Set' : 'Not set');
console.log('NEXTAUTH_URL:', config.nextAuth.url ? 'Set' : 'Not set');
console.log('NEXTAUTH_URL:', config.nextAuth.url);

export { GET, POST };