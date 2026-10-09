 
import api from "./axios";
import type {
  LoginRequest,
  LoginResponse,
} from "../types/auth.types";

export interface SignupRequest {
  organizationName: string;
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  message: string;
  userId: number;
  organizationId: number;
  name: string;
  email: string;
  role: string;
}

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    credentials
  );

  return response.data;
};

export const signup = async (
  data: SignupRequest
): Promise<SignupResponse> => {
  const response = await api.post<SignupResponse>(
    "/auth/signup",
    data
  );

  return response.data;
};