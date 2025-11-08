import axios from "axios";
import type {
  User,
  Room,
  ChatMessage,
  MessagesResponse,
  AuthResponse,
  ApiResponse,
} from "./types";
import { storage } from "@shared/utils/storage";

// API base configuration - Load from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api/v1";

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

// Response interceptor to handle auth errors and new API format
apiClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      // New backend API returns { status, message, data } or { success, message, data }
      // Check for both status="success" and success=true formats
      // Note: data can be null for DELETE operations
      const hasNewFormat =
        response.data.status !== undefined ||
        response.data.success !== undefined;

      if (hasNewFormat) {
        console.log("📡 [API] New format response:", response.data);
        // Normalize to success boolean format
        const normalizedResponse = {
          success:
            response.data.status === "success" ||
            response.data.success === true,
          message: response.data.message,
          data: response.data.data,
        };
        console.log("📡 [API] Normalized response:", normalizedResponse);
        return normalizedResponse;
      }
      // Legacy format - return data directly
      return response.data;
    }
    return response;
  },
  (error) => {
    console.error("📡 [API] Error interceptor:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      storage.clearAuth();
      window.location.href = "/";
    }

    // If it's a server error with new API format in error response, handle it
    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.status || errorData.success !== undefined) {
        console.log("📡 [API] Server error with new format:", errorData);
        // Convert server error to normalized format
        const normalizedError = {
          success: false,
          message: errorData.message || error.message,
          data: errorData.data || null,
        };
        console.log("📡 [API] Normalized error:", normalizedError);
        return Promise.reject(new Error(normalizedError.message));
      }
    }

    return Promise.reject(error);
  }
);
// dto map dữ liệu clean code sau
type BackendUser = {
  uuid?: string;
  id?: string; // fallback
  user_uuid?: string; // from backend
  email_address?: string;
  email?: string; // fallback
  user_email?: string; // from backend
  full_name?: string;
  name?: string; // fallback
  fullname?: string; // fallback
  user_fullname?: string; // from backend
  role?: "Admin" | "Member";
  user_role?: "Admin" | "Member"; // fallback from backend
  created_at?: string;
  updated_at?: string;
  user_created_at?: string; // from backend
  user_updated_at?: string; // from backend
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
    user_uuid:
      backendUser.user_uuid || backendUser.uuid || backendUser.id || "",
    user_email:
      backendUser.user_email ||
      backendUser.email_address ||
      backendUser.email ||
      "",
    user_fullname:
      backendUser.user_fullname ||
      backendUser.full_name ||
      backendUser.name ||
      backendUser.fullname ||
      "",
    user_role: (backendUser.user_role || backendUser.role || "Member") as
      | "Admin"
      | "Member",
    user_created_at:
      backendUser.user_created_at ||
      backendUser.created_at ||
      new Date().toISOString(),
    user_updated_at:
      backendUser.user_updated_at ||
      backendUser.updated_at ||
      new Date().toISOString(),
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
    const response: ApiResponse<{ token: string; user: BackendUser }> =
      await apiClient.post("/auth/login", {
        user_email: email,
        user_password: password,
      });
    console.log("🔐 [authApi] Login response:", response);

    // Handle new API format { success, message, data: { token, user } }
    if (response.success) {
      const mappedUser = mapBackendUserToFrontend(response.data.user);
      console.log("✅ [authApi] Login successful, mapped user:", mappedUser);

      return {
        message: response.message,
        data: {
          user: mappedUser,
          token: response.data.token,
        },
      };
    } else {
      throw new Error(response.message || "Login failed");
    }
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
    console.log("🚀 [roomsApi.createRoom] Sending request:", {
      room_name: name,
      is_direct_chat: isDirectChat,
      url: `${API_BASE_URL}/rooms`,
    });

    const response = await apiClient.post("/rooms", {
      room_name: name,
      is_direct_chat: isDirectChat,
    });

    console.log("📦 [roomsApi.createRoom] Full response:", {
      status: response.status,
      data: response.data || response,
      timestamp: new Date().toISOString(),
    });

    // API interceptor đã xử lý response.data, nên response chính là data
    const room = response.data || response;
    console.log("🏠 [roomsApi.createRoom] Extracted room:", room);

    return room;
  },

  listRooms: async (): Promise<Room[]> => {
    console.log("📋 [roomsApi.listRooms] Starting request to /rooms...");

    try {
      const response: ApiResponse<Room[]> = await apiClient.get("/rooms");
      console.log("📋 [roomsApi.listRooms] Raw response:", response);
      console.log("📋 [roomsApi.listRooms] Response type:", typeof response);
      console.log(
        "📋 [roomsApi.listRooms] Response keys:",
        Object.keys(response)
      );

      if (response.success) {
        console.log(
          "✅ [roomsApi.listRooms] Rooms with last_message:",
          response.data
        );
        return response.data;
      } else {
        console.error("❌ [roomsApi.listRooms] Failed:", response.message);
        throw new Error(response.message || "Failed to load rooms");
      }
    } catch (error) {
      console.error("💥 [roomsApi.listRooms] Exception caught:", error);
      throw error;
    }
  },

  getRoom: async (roomID: number): Promise<Room> => {
    console.log(`📋 [roomsApi.getRoom] Getting room ${roomID}...`);

    try {
      const response: ApiResponse<Room> = await apiClient.get(
        `/rooms/${roomID}`
      );
      console.log(
        `📋 [roomsApi.getRoom] Response for room ${roomID}:`,
        response
      );

      if (response.success) {
        return response.data;
      } else {
        console.error(`❌ [roomsApi.getRoom] Failed:`, response.message);
        throw new Error(response.message || "Failed to get room");
      }
    } catch (error) {
      console.error(
        `💥 [roomsApi.getRoom] Exception for room ${roomID}:`,
        error
      );
      throw error;
    }
  },

  getRoomMembers: async (roomID: number): Promise<User[]> => {
    console.log(
      `👥 [roomsApi.getRoomMembers] Getting members for room ${roomID}...`
    );

    try {
      const response: ApiResponse<User[]> = await apiClient.get(
        `/rooms/${roomID}/members`
      );
      console.log(
        `👥 [roomsApi.getRoomMembers] Response for room ${roomID}:`,
        response
      );

      if (response.success) {
        // Map backend users to frontend format if needed
        const mappedUsers = response.data.map((user) =>
          typeof user === "object" && user !== null
            ? mapBackendUserToFrontend(user as BackendUser)
            : (user as User)
        );
        return mappedUsers;
      } else {
        console.error(`❌ [roomsApi.getRoomMembers] Failed:`, response.message);
        throw new Error(response.message || "Failed to get room members");
      }
    } catch (error) {
      console.error(
        `💥 [roomsApi.getRoomMembers] Exception for room ${roomID}:`,
        error
      );
      throw error;
    }
  },

  joinRoomByCode: async (code: string): Promise<Room> => {
    console.log(`🚪 [roomsApi.joinRoomByCode] Joining room with code: ${code}`);

    try {
      const response: ApiResponse<Room> = await apiClient.post(
        "/rooms/join-by-code",
        {
          room_code: code,
        }
      );
      console.log(`🚪 [roomsApi.joinRoomByCode] Response:`, response);

      if (response.success) {
        return response.data;
      } else {
        console.error(`❌ [roomsApi.joinRoomByCode] Failed:`, response.message);
        throw new Error(response.message || "Failed to join room");
      }
    } catch (error) {
      console.error(`💥 [roomsApi.joinRoomByCode] Exception:`, error);
      throw error;
    }
  },

  getRoomMessages: async (
    roomID: number,
    cursor?: number,
    limit: number = 50
  ): Promise<MessagesResponse> => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) {
      params.append("cursor", cursor.toString());
    }

    const response: ApiResponse<MessagesResponse> = await apiClient.get(
      `/rooms/${roomID}/messages?${params}`
    );
    console.log(
      `📜 [roomsApi.getRoomMessages] Room ${roomID} messages:`,
      response
    );

    if (response.success) {
      console.log(
        "✅ [roomsApi.getRoomMessages] Messages with pagination:",
        response.data
      );
      return response.data;
    } else {
      console.error("❌ [roomsApi.getRoomMessages] Failed:", response.message);
      throw new Error(response.message || "Failed to load messages");
    }
  },

  sendMessage: async (
    roomID: number,
    content: string
  ): Promise<ChatMessage> => {
    console.log(
      `💬 [roomsApi.sendMessage] Sending message to room ${roomID}: ${content}`
    );

    try {
      const response: ApiResponse<ChatMessage> = await apiClient.post(
        `/rooms/${roomID}/messages`,
        {
          content,
        }
      );
      // console.log(`💬 [roomsApi.sendMessage] Response:`, response);

      if (response.success) {
        // console.log(
        //   `✅ [roomsApi.sendMessage] Message sent successfully:`,
        //   response.data
        // );
        return response.data;
      } else {
        console.error(`❌ [roomsApi.sendMessage] Failed:`, response.message);
        throw new Error(response.message || "Failed to send message");
      }
    } catch (error) {
      console.error(`💥 [roomsApi.sendMessage] Exception:`, error);
      throw error;
    }
  },

  // 🆕 NEW: Mark room as read
  markRoomAsRead: async (roomID: number): Promise<void> => {
    console.log(
      `✅ [roomsApi.markRoomAsRead] Marking room ${roomID} as read...`
    );

    try {
      const response: ApiResponse<null> = await apiClient.post(
        `/rooms/${roomID}/mark-read`,
        {
          last_message_id: 0, // Backend will use latest message
        }
      );

      if (response.success) {
        console.log(
          `✅ [roomsApi.markRoomAsRead] Room ${roomID} marked as read`
        );
      } else {
        console.error(`❌ [roomsApi.markRoomAsRead] Failed:`, response.message);
        throw new Error(response.message || "Failed to mark room as read");
      }
    } catch (error) {
      console.error(
        `💥 [roomsApi.markRoomAsRead] Exception for room ${roomID}:`,
        error
      );
      throw error;
    }
  },
};

// Admin API
export const adminApi = {
  getAllUsers: async (
    page: number = 1,
    perPage: number = 10
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  }> => {
    console.log(
      `🔍 [adminApi.getAllUsers] Getting users page ${page}, per_page ${perPage}...`
    );

    try {
      const response: ApiResponse<{
        users: BackendUser[];
        total: number;
        page: number;
        per_page: number;
        total_pages: number;
      }> = await apiClient.get(`/admin/users?page=${page}&per_page=${perPage}`);
      console.log("🔍 [adminApi.getAllUsers] Response:", response);

      if (response.success) {
        const users = response.data.users.map(mapBackendUserToFrontend);
        console.log("🔍 [adminApi.getAllUsers] Mapped users:", users);
        return {
          users,
          total: response.data.total,
          page: response.data.page,
          per_page: response.data.per_page,
          total_pages: response.data.total_pages,
        };
      } else {
        console.error("❌ [adminApi.getAllUsers] Failed:", response.message);
        throw new Error(response.message || "Failed to get users");
      }
    } catch (error) {
      console.error("💥 [adminApi.getAllUsers] Exception:", error);
      throw error;
    }
  },

  updateUserRole: async (
    user_uuid: string,
    role: "Admin" | "Member"
  ): Promise<User> => {
    console.log(
      `🔍 [adminApi.updateUserRole] Updating role for ${user_uuid} to ${role}...`
    );

    try {
      const response: ApiResponse<BackendUser> = await apiClient.patch(
        `/admin/users/${user_uuid}/role`,
        {
          role: role,
        }
      );
      console.log("🔍 [adminApi.updateUserRole] Response:", response);

      if (response.success) {
        const mappedUser = mapBackendUserToFrontend(response.data);
        console.log("🔍 [adminApi.updateUserRole] Updated user:", mappedUser);
        return mappedUser;
      } else {
        console.error("❌ [adminApi.updateUserRole] Failed:", response.message);
        throw new Error(response.message || "Failed to update user role");
      }
    } catch (error) {
      console.error("💥 [adminApi.updateUserRole] Exception:", error);
      throw error;
    }
  },

  deleteUser: async (user_uuid: string): Promise<void> => {
    console.log(`🗑️ [adminApi.deleteUser] Deleting user ${user_uuid}...`);

    try {
      const response: ApiResponse<null> = await apiClient.delete(
        `/admin/users/${user_uuid}`
      );
      console.log("🗑️ [adminApi.deleteUser] Response:", response);

      if (!response.success) {
        console.error("❌ [adminApi.deleteUser] Failed:", response.message);
        throw new Error(response.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("💥 [adminApi.deleteUser] Exception:", error);
      throw error;
    }
  },

  getAllRooms: async (
    page: number = 1,
    perPage: number = 10
  ): Promise<{
    rooms: Room[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  }> => {
    console.log(`🏢 [adminApi.getAllRooms] Getting rooms page ${page}...`);

    try {
      const response: ApiResponse<{
        rooms: Room[];
        total: number;
        page: number;
        per_page: number;
        total_pages: number;
      }> = await apiClient.get(`/admin/rooms?page=${page}&per_page=${perPage}`);
      console.log("📊 [adminApi.getAllRooms] Response:", response);

      if (response.success) {
        console.log("🏠 [adminApi.getAllRooms] Rooms data:", response.data);
        return response.data;
      } else {
        console.error("❌ [adminApi.getAllRooms] Failed:", response.message);
        throw new Error(response.message || "Failed to get rooms");
      }
    } catch (error) {
      console.error("💥 [adminApi.getAllRooms] Exception:", error);
      throw error;
    }
  },

  getRoomDetails: async (room_id: number): Promise<Room> => {
    console.log(`🏢 [adminApi.getRoomDetails] Getting room ${room_id}...`);

    try {
      const response: ApiResponse<Room> = await apiClient.get(
        `/admin/rooms/${room_id}`
      );
      console.log(
        `📊 [adminApi.getRoomDetails] Response for room ${room_id}:`,
        response
      );

      if (response.success) {
        return response.data;
      } else {
        console.error("❌ [adminApi.getRoomDetails] Failed:", response.message);
        throw new Error(response.message || "Failed to get room details");
      }
    } catch (error) {
      console.error(
        `💥 [adminApi.getRoomDetails] Exception for room ${room_id}:`,
        error
      );
      throw error;
    }
  },

  deleteRoom: async (room_id: number): Promise<void> => {
    console.log(`🗑️ [adminApi.deleteRoom] Deleting room ${room_id}...`);

    try {
      const response: ApiResponse<null> = await apiClient.delete(
        `/admin/rooms/${room_id}`
      );
      console.log(
        `🗑️ [adminApi.deleteRoom] Response for room ${room_id}:`,
        response
      );

      if (!response.success) {
        console.error("❌ [adminApi.deleteRoom] Failed:", response.message);
        throw new Error(response.message || "Failed to delete room");
      }
    } catch (error) {
      console.error(
        `💥 [adminApi.deleteRoom] Exception for room ${room_id}:`,
        error
      );
      throw error;
    }
  },
};

export { apiClient };
