'use client'
import { SessionProvider } from "next-auth/react";

import { type ThemeProviderProps } from "next-themes";
import {ThemeProvider as NextThemesProvider} from "next-themes";
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>
  {children}
  </SessionProvider>;
}


export function ThemeProvider({children,...props}:ThemeProviderProps){
  return <NextThemesProvider {...props}>
    {children}
  </NextThemesProvider>
}