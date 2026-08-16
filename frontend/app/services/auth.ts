const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  User,
  RefreshResponse,
} from "@/types/auth";
import Cookies from "js-cookie";
import { apiFetch } from "../lib/apiFetch";

export async function Signup(data: SignupRequest): Promise<SignupResponse> {
  const response = await apiFetch("/api/v1/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", //
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Signup failed");
  }

  return response.json();
}

export async function Login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiFetch("/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Login error:", errorData);
    throw new Error(errorData.detail || "Login failed");
  }

  return response.json();
}

export async function getMe(accessToken: string): Promise<User> {
  const response = await apiFetch("/api/v1/auth/me", {
    method: "GET",

    credentials: "include",

    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.detail || "Failed to fetch user");
  }

  return response.json();
}

export async function logout() {
  const token = Cookies.get("access_token");

  const response = await apiFetch("/api/v1/auth/logout", {
    method: "POST",

    credentials: "include",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  return response.json();
}

export async function refresh(): Promise<RefreshResponse> {
  const response = await apiFetch("/api/v1/auth/refresh", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Refresh failed");
  }

  return response.json();
}
