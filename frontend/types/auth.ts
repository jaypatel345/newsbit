export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  guest_id: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  guest_id: string | null;
}

export interface SignupResponse {
  message: string;
  access_token: string;
  token_type: "bearer";
  user: User;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: "bearer";
  user: User;
}

export interface User {
  id: number;

  name: string;

  email: string;

  avatar_url: string | null;
}

export interface RefreshResponse {
  access_token: string;
  token_type: "bearer";
}
