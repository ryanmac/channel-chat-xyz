// components/AdminDashboard.tsx
"use client";

import { Suspense } from 'react';
import AdminChannelTable from '@/components/AdminChannelTable';
import AdminUserTable from '@/components/AdminUserTable';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <Suspense fallback={<div>Loading channels...</div>}>
        <AdminChannelTable />
      </Suspense>
      <Suspense fallback={<div>Loading users...</div>}>
        <AdminUserTable />
      </Suspense>
    </div>
  );
}