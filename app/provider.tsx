'use client'
import { SessionProvider } from "next-auth/react";
import { Appbar } from "./components/Appbar";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>
  {children}
  </SessionProvider>;
}
