import axios from "axios";
import type { User, Room, ChatMessage, AuthResponse } from "./types";
import { storage } from "@/utils/storage";

// API base configuration
const API_BASE_URL = "http://localhost:8081/api/v1";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
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
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      storage.clearAuth();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);
// dto map dữ liệu clean code sau
type BackendUser = {
  uuid?: string;
  id?: string; // fallback
  email_address?: string;
  email?: string; // fallback
  full_name?: string;
  name?: string; // fallback
  fullname?: string; // fallback
  role?: "Admin" | "Member";
  user_role?: "Admin" | "Member"; // fallback
  created_at?: string;
  updated_at?: string;
};

// helper map backend dto sang User interface với fallbacks
const mapBackendUserToFrontend = (
  backendUser: BackendUser | null | undefined
): User => {
  if (!backendUser) {
    console.warn("⚠️ mapBackendUserToFrontend: backendUser is null/undefined");
    return {
      user_uuid: "",
      user_email: "",
      user_fullname: "",
      user_role: "Member",
      user_created_at: new Date().toISOString(),
      user_updated_at: new Date().toISOString(),
    };
  }

  const mapped = {
    user_uuid: backendUser.uuid || backendUser.id || "",
    user_email: backendUser.email_address || backendUser.email || "",
    user_fullname:
      backendUser.full_name || backendUser.name || backendUser.fullname || "",
    user_role: (backendUser.role || backendUser.user_role || "Member") as
      | "Admin"
      | "Member",
    user_created_at: backendUser.created_at || new Date().toISOString(),
    user_updated_at: backendUser.updated_at || new Date().toISOString(),
  };

  console.log("🔄 mapBackendUserToFrontend:", {
    input: backendUser,
    output: mapped,
  });
  return mapped;
};
// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/login", {
      user_email: email,
      user_password: password,
    });
    console.log("Login response:", response);
    const mappedUser = mapBackendUserToFrontend(
      response.data.data?.user || response.data.user
    );
    console.log("Mapped user:", mappedUser);
    return {
      message: response.data.message,
      data: {
        user: mappedUser,
        token: response.data.data?.token || response.data.token,
      },
    };
  },

  register: async (
    email: string,
    password: string,
    fullname: string
  ): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/register", {
      user_email: email,
      user_password: password,
      user_fullname: fullname,
    });

    console.log("🔍 Register response:", response);

    // Map backend DTO to frontend format tương tự login
    const mappedUser = mapBackendUserToFrontend(
      response.data.data?.user || response.data.user
    );
    console.log("🔍 Mapped register user:", mappedUser);

    return {
      message: response.data.message || "Registration successful",
      data: {
        user: mappedUser,
        token: response.data.data?.token || response.data.token,
      },
    };
  },

  logout: async (): Promise<void> => {
    console.log("📡 [authApi] Gửi logout request đến server...", {
      url: `${API_BASE_URL}/auth/logout`,
      timestamp: new Date().toISOString(),
      hasToken: !!storage.getToken(),
    });

    try {
      const response = await apiClient.post("/auth/logout");
      console.log("✅ [authApi] Logout API response:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error: unknown) {
      console.error("❌ [authApi] Logout API error:", error);
      throw error; // Re-throw để useAuth có thể handle
    }
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get("/auth/me");
    console.log("🔍 GetMe response:", response);

    const mappedUser = mapBackendUserToFrontend(
      response.data.data || response.data
    );
    console.log("🔍 Mapped getMe user:", mappedUser);

    return mappedUser;
  },
};

// Rooms API
export const roomsApi = {
  createRoom: async (
    name: string,
    isDirectChat: boolean = false
  ): Promise<Room> => {
    const response = await apiClient.post("/rooms", {
      room_name: name,
      is_direct_chat: isDirectChat,
    });
    return response.data.data;
  },

  listRooms: async (): Promise<Room[]> => {
    const response = await apiClient.get("/rooms");
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
    const response = await apiClient.post("/rooms/join-by-code", {
      room_code: code,
    });
    return response.data.data;
  },

  getRoomMessages: async (roomID: number): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/rooms/${roomID}/messages`);
    return response.data.data;
  },

  sendMessage: async (
    roomID: number,
    content: string
  ): Promise<ChatMessage> => {
    const response = await apiClient.post(`/rooms/${roomID}/messages`, {
      content,
    });
    return response.data.data;
  },
};

// Admin API
export const adminApi = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get("/admin/users");
    console.log("🔍 GetAllUsers response:", response);

    // Map array of backend users to frontend format
    const users = (response.data.data || response.data).map(
      mapBackendUserToFrontend
    );
    console.log("🔍 Mapped users:", users);

    return users;
  },

  deleteUser: async (user_uuid: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${user_uuid}`);
  },

  getAllRooms: async (): Promise<Room[]> => {
    const response = await apiClient.get("/admin/rooms");
    return response.data.data;
  },

  getRoomDetails: async (room_id: number): Promise<Room> => {
    const response = await apiClient.get(`/admin/rooms/${room_id}`);
    return response.data.data;
  },

  deleteRoom: async (room_id: number): Promise<void> => {
    await apiClient.delete(`/admin/rooms/${room_id}`);
  },
};

export { apiClient };
