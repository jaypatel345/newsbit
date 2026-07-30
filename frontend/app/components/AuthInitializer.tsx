"use client";

import { useMe } from "@/app/hooks/useAuth";

export default function AuthInitializer() {
  useMe();

  return null;
}
