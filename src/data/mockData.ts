import type { User, Room, ChatMessage } from '../services/types';

export const mockUsers: User[] = [
  { 
    user_uuid: "550e8400-e29b-41d4-a716-446655440001", 
    user_email: 'admin@demo.com',  
    user_fullname: 'Admin Demo',
    user_role: 'Admin',
    user_created_at: '2024-01-01T00:00:00Z',
    user_updated_at: '2024-01-01T00:00:00Z',
    user_password: 'admin123' // For login testing only
  },
  { 
    user_uuid: "550e8400-e29b-41d4-a716-446655440002", 
    user_email: 'alice@demo.com',  
    user_fullname: 'Alice Johnson',
    user_role: 'Member',
    user_created_at: '2024-01-02T00:00:00Z',
    user_updated_at: '2024-01-02T00:00:00Z',
    user_password: 'alice123' // For login testing only
  },
  { 
    user_uuid: "550e8400-e29b-41d4-a716-446655440003", 
    user_email: 'bob@demo.com',  
    user_fullname: 'Bob Smith',
    user_role: 'Member',
    user_created_at: '2024-01-03T00:00:00Z',
    user_updated_at: '2024-01-03T00:00:00Z',
    user_password: 'bob123' // For login testing only
  },
  { 
    user_uuid: "550e8400-e29b-41d4-a716-446655440004", 
    user_email: 'charlie@demo.com',  
    user_fullname: 'Charlie Brown',
    user_role: 'Member',
    user_created_at: '2024-01-04T00:00:00Z',
    user_updated_at: '2024-01-04T00:00:00Z',
    user_password: 'charlie123' // For login testing only
  },
  { 
    user_uuid: "550e8400-e29b-41d4-a716-446655440005", 
    user_email: 'david@demo.com',  
    user_fullname: 'David Wilson',
    user_role: 'Member',
    user_created_at: '2024-01-05T00:00:00Z',
    user_updated_at: '2024-01-05T00:00:00Z',
    user_password: 'david123' // For login testing only
  },
];

export const mockRooms: Room[] = [
  { 
    room_id: 101,
    room_code: 'ABC123',
    room_name: 'Trò chuyện chung',
    room_is_direct_chat: false,
    room_created_by: "550e8400-e29b-41d4-a716-446655440001",
    room_created_at: '2024-01-01T00:00:00Z',
    room_updated_at: '2024-01-01T00:00:00Z',
    // lastMessage: 'David: Anyone here?', 
    // unread: 5, 
    members: ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002", "550e8400-e29b-41d4-a716-446655440003", "550e8400-e29b-41d4-a716-446655440004", "550e8400-e29b-41d4-a716-446655440005"]
  },
  { 
    room_id: 201,
    room_code: 'DEF456',
    room_name: "bé <3", // Direct chat không có tên
    room_is_direct_chat: true,
    room_created_by: "550e8400-e29b-41d4-a716-446655440001",
    room_created_at: '2024-01-02T00:00:00Z',
    room_updated_at: '2024-01-02T00:00:00Z',
    // lastMessage: 'You: I have submitted the report.', 
    // unread: 0, 
    members: ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"]
  },
  { 
    room_id: 102,
    room_code: 'GHI789',
    room_name: 'Dự án "Titan"',
    room_is_direct_chat: false,
    room_created_by: "550e8400-e29b-41d4-a716-446655440001",
    room_created_at: '2024-01-03T00:00:00Z',
    room_updated_at: '2024-01-03T00:00:00Z',
    // lastMessage: 'You: Let\'s have a meeting tomorrow.', 
    // unread: 0, 
    members: ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002", "550e8400-e29b-41d4-a716-446655440004", "550e8400-e29b-41d4-a716-446655440005"]
  },
  { 
    room_id: 202,
    room_code: 'JKL012',
    room_name: null, // Direct chat không có tên
    room_is_direct_chat: true,
    room_created_by: "550e8400-e29b-41d4-a716-446655440001",
    room_created_at: '2024-01-04T00:00:00Z',
    room_updated_at: '2024-01-04T00:00:00Z',
    // lastMessage: 'Bob: OK, I will check it.', 
    // unread: 2, 
    members: ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440003"]
  },
];

export const mockMessages: Record<string, ChatMessage[]> = {
  'private-202': [
    { 
      message_id: 1,
      room_id: 202,
      user_uuid: "550e8400-e29b-41d4-a716-446655440003",
      content: 'Hi, can we discuss the new design?',
      message_created_at: '2024-01-01T10:31:00Z'
    },
    { 
      message_id: 2,
      room_id: 202,
      user_uuid: "550e8400-e29b-41d4-a716-446655440001",
      content: 'Sure, I am available now.',
      message_created_at: '2024-01-01T10:32:00Z'
    },
    { 
      message_id: 3,
      room_id: 202,
      user_uuid: "550e8400-e29b-41d4-a716-446655440003",
      content: 'OK, I will check it.',
      message_created_at: '2024-01-01T10:35:00Z'
    },
  ],
  'public-101': [
    { 
      message_id: 4,
      room_id: 101,
      user_uuid: "550e8400-e29b-41d4-a716-446655440004",
      content: 'Hello everyone!',
      message_created_at: '2024-01-01T09:00:00Z'
    },
    { 
      message_id: 5,
      room_id: 101,
      user_uuid: "550e8400-e29b-41d4-a716-446655440005",
      content: 'Anyone here?',
      message_created_at: '2024-01-01T09:30:00Z'
    },
  ]
};
