export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
}

export interface SignupResponse {
  message: string;
  access_token: string;
  token_type: "bearer";
  user: User;
}
