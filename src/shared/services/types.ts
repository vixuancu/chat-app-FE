// src/services/types.ts
export interface User {
  user_uuid: string;
  user_email: string;
  user_fullname: string;
  user_role: "Admin" | "Member";
  user_created_at: string;
  user_updated_at: string;
  user_password?: string; // Optional for security
}

export interface Room {
  room_id: number;
  room_code: string;
  room_name: string | null;
  room_is_direct_chat: boolean;
  room_created_by: string;
  room_created_at: string;
  room_updated_at: string;
  member_count?: number; // From admin API response
  last_message?: {
    message_id: number;
    content: string;
    sender_name: string;
    sender_uuid: string;
    created_at: string;
    is_own: boolean; // true if message is from current user
  };
  // Frontend-only fields (deprecated - now from backend)
  unread?: number; // Calculated from messages
  members?: string[]; // Will get from room_members table - contains user_uuid strings
}

export interface RoomMember {
  user_uuid: string;
  room_id: number;
  member_role: "Owner" | "Admin" | "Member";
  room_member_created_at: string;
  room_member_updated_at: string;
}

export interface ChatMessage {
  message_id: number;
  room_id: number;
  user_uuid: string;
  user_fullname: string; // Added from new API response
  user_email: string; // Added from new API response
  content: string;
  created_at: string; // Changed from message_created_at to match backend
  is_own: boolean; // Added to indicate if message belongs to current user
}

export interface AuthResponse {
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// New Backend API Response Structure
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: "room_joined" | "new_message" | "error";
  room_id?: number;
  data?: string; // JSON string for message data
  content?: string; // For error messages
}

// WebSocket Message Send Format
export interface WebSocketSendMessage {
  type: "send_message" | "join_room" | "leave_room";
  room_id?: number;
  content?: string;
  data?: {
    room_id: number;
  };
}
