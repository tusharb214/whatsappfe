export type Role = "SUPER_ADMIN" | "ADMIN" | "AGENT";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: Role;
  organizationId: number | null;
}

export interface AuthUser {
  userId: number;
  name: string;
  email: string;
  role: Role;
  organizationId: number | null;
}