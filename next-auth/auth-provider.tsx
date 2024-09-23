// next-auth/auth-provider.tsx
"use client";

import React, { createContext, useContext } from "react";
import { useSession as useNextAuthSession } from "next-auth/react";
import { Session } from "next-auth";

type SessionContextType = {
  session: Session | null;
  status: "authenticated" | "loading" | "unauthenticated";
};

const SessionContext = createContext<SessionContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useNextAuthSession();

  return (
    <SessionContext.Provider value={{ session, status }}>
      {children}
    </SessionContext.Provider>
  );
};

// Export useSession from the custom context, not directly from next-auth
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within an AuthProvider");
  }
  return context;
};