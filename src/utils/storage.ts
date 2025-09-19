import type { User } from '@/services/types';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'chat_app_token',
  USER_DATA: 'chat_app_user',
} as const;

export const storage = {
  // Token management
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  clearToken(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  // User data management
  getUser(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData) as User;
    } catch {
      return null;
    }
  },

  setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  clearUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  // Clear all auth data
  clearAuth(): void {
    this.clearToken();
    this.clearUser();
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  },

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.user_role === 'Admin';
  }
};
