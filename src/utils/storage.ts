import type { AuthUser } from "../types/auth.types";

const ACCESS_TOKEN_KEY = "accessToken";
const AUTH_USER_KEY = "authUser";

export const storage = {
  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  removeAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  setAuthUser(user: AuthUser): void {
    localStorage.setItem(
      AUTH_USER_KEY,
      JSON.stringify(user)
    );
  },

  getAuthUser(): AuthUser | null {
    const user = localStorage.getItem(AUTH_USER_KEY);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as AuthUser;
    } catch {
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
  },

  removeAuthUser(): void {
    localStorage.removeItem(AUTH_USER_KEY);
  },

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },
};