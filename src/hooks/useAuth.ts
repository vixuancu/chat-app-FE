import { useState, useCallback } from 'react';
import { authApi } from '@/services/api';
import { storage } from '@/utils/storage';
import type { User, AuthResponse } from '@/services/types';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullname: string) => Promise<void>;
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
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, fullname: string) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authApi.register(email, password, fullname);
      const { user: userData, token } = response.data;
      
      // Save to storage
      storage.setToken(token);
      storage.setUser(userData);
      setUser(userData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API fails
    } finally {
      // Clear storage and state
      storage.clearAuth();
      setUser(null);
      setIsInitialized(true); // Đảm bảo isInitialized = true để tránh loading vô tận
      setIsLoading(false);
    }
  }, []);

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
      console.error('Failed to refresh user:', error);
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
    refreshUser
  };
};
