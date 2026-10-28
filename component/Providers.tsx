// components/Providers.tsx
"use client";

import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { LoaderProvider } from "@/lib/loader-context";
import InviteLoader from "./loader/InviteLoader";
import { TooltipProvider } from "./ui/tooltip";
import { Toaster } from "./ui/toaster";
import { Toaster as Sonner } from "./ui/sonner";
import { SiteProtection } from "./SiteProtection";
import { CartProvider } from "./cart/CartProvider";

type ProvidersProps = {
  children: React.ReactNode;
};

function RouteAwareProviders({ children }: ProvidersProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <LoaderProvider>
      {!isAdmin && <InviteLoader />}
      <Toaster />
      <Sonner />
      {isAdmin ? children : <CartProvider>{children}</CartProvider>}
    </LoaderProvider>
  );
}

export default function Providers({ children }: ProvidersProps) {
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
        <Suspense fallback={null}>
          <RouteAwareProviders>
            {children}
          </RouteAwareProviders>
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
