// components/GuestInitializer.tsx
"use client";

import { useEffect } from "react";
import { getGuestId } from "@/app/lib/guest";

export default function GuestInitializer() {
  useEffect(() => {
    getGuestId();
  }, []);

  return null;
}
