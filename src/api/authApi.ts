import api from "./axios";
import type {
  LoginRequest,
  LoginResponse,
} from "../types/auth.types";

export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    credentials
  );

  return response.data;
};