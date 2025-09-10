// src/services/types.ts
export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'Member';
  // Backend fields
  user_uuid?: string;
  user_email?: string;
  user_fullname?: string;
  user_created_at?: string;
  user_updated_at?: string;
}

export interface Room {
  id: string;
  name: string;
  lastMessage: string;
  unread: number;
  members: number[];
  type: 'Public' | 'Private';
  // Backend fields
  room_id?: number;
  room_code?: string;
  room_name?: string | null;
  room_is_direct_chat?: boolean;
  room_created_by?: string;
  room_created_at?: string;
  room_updated_at?: string;
}

export interface ChatMessage {
  userId: number;
  text: string;
  time: string;
  // Backend fields
  message_id?: number;
  room_id?: number;
  user_uuid?: string;
  content?: string;
  message_created_at?: string;
}

export interface AuthResponse {
  message: string;
  data: {
    user: User;
    token: string;
  };
}