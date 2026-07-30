"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, Login, logout, Signup } from "../services/auth";
import Cookies from "js-cookie";

export function useSignup() {
  return useMutation({
    mutationFn: Signup,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: Login,
  });
}

export function useMe() {
  const token = Cookies.get("access_token");

  return useQuery({
    queryKey: ["me"],

    queryFn: () => getMe(token!),

    enabled: !!token,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    onSuccess: () => {
      Cookies.remove("access_token");

      queryClient.removeQueries({
        queryKey: ["me"],
      });
    },
  });
}
