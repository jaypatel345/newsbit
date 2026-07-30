const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  User,
} from "@/types/auth";
import Cookies from "js-cookie";

export async function Signup(data: SignupRequest): Promise<SignupResponse> {
  const response = await fetch(`${BASE_URL}/auth/signup`, {
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
  const response = await fetch(`${BASE_URL}/auth/login`, {
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

export async function getMe(accessToken: string): Promise<User> {
  const response = await fetch(`${BASE_URL}/auth/me`, {
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

  const response = await fetch(`${BASE_URL}/auth/logout`, {
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
