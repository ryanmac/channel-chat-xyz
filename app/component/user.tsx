// app/component/user.tsx
"use client";

// import { useSession } from "next-auth/react";
import { useSession } from "@/next-auth/auth-provider";

export const User = () => {
  const { session, status } = useSession();
  return (
    <pre>
      {JSON.stringify({ session, status }, null, 2)}
    </pre>
  );
};