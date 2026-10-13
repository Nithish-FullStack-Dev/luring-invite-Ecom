// components/Providers.tsx
"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoaderProvider } from "@/lib/loader-context";
import InviteLoader from "./loader/InviteLoader";
import { TooltipProvider } from "./ui/tooltip";
import { Toaster } from "./ui/toaster";
import { Toaster as Sonner } from "./ui/sonner";
// import SiteProtection from "./SiteProtection";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  const isAdmin = usePathname().startsWith("/admin");
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LoaderProvider>
          {!isAdmin && <InviteLoader />}
          <Toaster />
          <Sonner />
          {/* <SiteProtection /> */}
          {children}
        </LoaderProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
