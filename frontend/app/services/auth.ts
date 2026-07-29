const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { SignupRequest, SignupResponse } from "@/types/auth";

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
