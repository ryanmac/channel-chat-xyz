// app/admin/page.tsx
import { redirect } from 'next/navigation';
import { auth } from "@/auth"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import AdminDashboard from '@/components/AdminDashboard';

export default async function AdminPage() {
  const session = await auth();
  console.log("Session in AdminPage:", session?.user);
  
  console.log("Rendering AdminDashboard");
  return (
    <div className="min-h-screen">
      <Header />
      <AdminDashboard />
      <Footer />
    </div>
  );
}