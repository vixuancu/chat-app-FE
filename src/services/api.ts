import axios from 'axios';
import type { User, Room, ChatMessage, AuthResponse } from './types';
import { storage } from '@/utils/storage';

// API base configuration
const API_BASE_URL = 'http://localhost:8081/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      storage.clearAuth();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', {
         user_email: email,
         user_password: password 
        });
    return response.data;
  },

  register: async (email: string, password: string, fullname: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', { 
     user_email: email,        
     user_password: password,  
     user_fullname: fullname   
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  }
};

// Rooms API
export const roomsApi = {
  createRoom: async (name: string, isDirectChat: boolean = false): Promise<Room> => {
    const response = await apiClient.post('/rooms', { 
      room_name:name, 
      is_direct_chat: isDirectChat 
    });
    return response.data.data;
  },

  listRooms: async (): Promise<Room[]> => {
    const response = await apiClient.get('/rooms');
    return response.data.data;
  },

  getRoom: async (roomID: number): Promise<Room> => {
    const response = await apiClient.get(`/rooms/${roomID}`);
    return response.data.data;
  },

  getRoomMembers: async (roomID: number): Promise<User[]> => {
    const response = await apiClient.get(`/rooms/${roomID}/members`);
    return response.data.data;
  },

  joinRoomByCode: async (code: string): Promise<Room> => {
    const response = await apiClient.post('/rooms/join-by-code', { room_code: code });
    return response.data.data;
  },

  getRoomMessages: async (roomID: number): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/rooms/${roomID}/messages`);
    return response.data.data;
  },

  sendMessage: async (roomID: number, content: string): Promise<ChatMessage> => {
    const response = await apiClient.post(`/rooms/${roomID}/messages`, { content });
    return response.data.data;
  }
};

// Admin API
export const adminApi = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/admin/users');
    return response.data.data;
  },

  deleteUser: async (user_uuid: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${user_uuid}`);
  },

  getAllRooms: async (): Promise<Room[]> => {
    const response = await apiClient.get('/admin/rooms');
    return response.data.data;
  },

  getRoomDetails: async (room_id: number): Promise<Room> => {
    const response = await apiClient.get(`/admin/rooms/${room_id}`);
    return response.data.data;
  },

  deleteRoom: async (room_id: number): Promise<void> => {
    await apiClient.delete(`/admin/rooms/${room_id}`);
  }
};

export { apiClient };
