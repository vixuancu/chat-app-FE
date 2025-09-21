// src/services/types.ts
export interface User { 
  user_uuid: string;
  user_email: string;
  user_fullname: string;
  user_role: 'Admin' | 'Member';
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
  // Frontend-only fields (not in backend)
  lastMessage?: string; // Calculated from messages
  unread?: number; // Calculated from messages
  members?: string[]; // Will get from room_members table - contains user_uuid strings
}

export interface RoomMember {
  user_uuid: string;
  room_id: number;
  member_role: 'Owner' | 'Admin' | 'Member';
  room_member_created_at: string;
  room_member_updated_at: string;
}

export interface ChatMessage {
  message_id: number;
  room_id: number;
  user_uuid: string;
  content: string;
  message_created_at: string;
}

export interface AuthResponse {
  message: string;
  data: {
    user: User;
    token: string;
  };
}