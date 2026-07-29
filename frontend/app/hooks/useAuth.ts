"use client";

import { useMutation } from "@tanstack/react-query";
import { Signup } from "../services/auth";

export function useSignup() {
  return useMutation({
    mutationFn: Signup,
  });
}
