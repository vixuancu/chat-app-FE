import { useState, useCallback } from "react";
import { authApi } from "@shared/services/api";
import { storage } from "@shared/utils/storage";
import type { User, AuthResponse } from "@shared/services/types";

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullname: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(storage.getUser());
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(!!storage.getUser());

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authApi.login(email, password);
      const { user: userData, token } = response.data;

      // Save to storage
      storage.setToken(token);
      storage.setUser(userData);
      setUser(userData);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullname: string) => {
      setIsLoading(true);
      try {
        const response: AuthResponse = await authApi.register(
          email,
          password,
          fullname
        );
        const { user: userData, token } = response.data;

        // Save to storage
        storage.setToken(token);
        storage.setUser(userData);
        setUser(userData);
      } catch (error) {
        console.error("Registration failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    console.log("🔄 [useAuth] Bắt đầu logout process...", {
      currentUser: user?.user_email,
      hasToken: !!storage.getToken(),
      timestamp: new Date().toISOString(),
    });

    setIsLoading(true);
    try {
      console.log("📡 [useAuth] Gọi logout API...");
      await authApi.logout();
      console.log("✅ [useAuth] Logout API call thành công");
    } catch (error) {
      console.error("⚠️ [useAuth] Logout API call thất bại:", error);
      console.log("🔄 [useAuth] Tiếp tục với local logout...");
    } finally {
      // Clear storage and state
      console.log("🧹 [useAuth] Clearing storage và state...");

      const tokenBefore = storage.getToken();
      const userBefore = storage.getUser();

      storage.clearAuth();
      setUser(null);
      setIsInitialized(true);
      setIsLoading(false);

      console.log("✅ [useAuth] Logout hoàn tất", {
        tokenCleared: tokenBefore ? "YES" : "NO",
        userCleared: userBefore ? "YES" : "NO",
        currentTokenExists: !!storage.getToken(),
        currentUserExists: !!storage.getUser(),
        stateReset: true,
        timestamp: new Date().toISOString(),
      });
    }
  }, [user]);

  const refreshUser = useCallback(async () => {
    if (!storage.getToken()) {
      setIsInitialized(true);
      return;
    }

    setIsLoading(true);
    try {
      const userData = await authApi.getMe();
      storage.setUser(userData);
      setUser(userData);
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // Token might be expired, clear auth
      storage.clearAuth();
      setUser(null);
      setIsInitialized(true);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: !!user && !!storage.getToken(),
    login,
    register,
    logout,
    refreshUser,
  };
};
