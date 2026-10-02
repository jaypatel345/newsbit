"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { MotionConfig } from "framer-motion";
import SmoothScroll from "@/app/components/motion/SmoothScroll";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SmoothScroll />
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
