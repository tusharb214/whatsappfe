import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  AuthUser,
  LoginRequest,
} from "../types/auth.types";

import { login as loginApi } from "../api/authApi";
import { storage } from "../utils/storage";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(
    null
  );

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  useEffect(() => {
    const storedUser = storage.getAuthUser();
    const token = storage.getAccessToken();

    if (storedUser && token) {
      setUser(storedUser);
    }

    setIsLoading(false);
  }, []);

  const login = async (
    credentials: LoginRequest
  ): Promise<void> => {
    const response = await loginApi(credentials);

    const authUser: AuthUser = {
      userId: response.userId,
      name: response.name,
      email: response.email,
      role: response.role,
      organizationId: response.organizationId,
    };

    storage.setAccessToken(response.token);
    storage.setAuthUser(authUser);

    setUser(authUser);
  };

  const logout = (): void => {
    storage.clear();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}