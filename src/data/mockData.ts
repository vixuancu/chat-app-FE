import type { User, Room, ChatMessage } from '../services/types';

export const mockUsers: User[] = [
  { 
    id: 1, 
    name: 'Admin Demo', 
    email: 'admin@demo.com', 
    avatar: 'https://placehold.co/40x40/7c3aed/ffffff?text=A', 
    role: 'Admin' 
  },
  { 
    id: 2, 
    name: 'Alice', 
    email: 'alice@demo.com', 
    avatar: 'https://placehold.co/40x40/f87171/ffffff?text=A', 
    role: 'Member' 
  },
  { 
    id: 3, 
    name: 'Bob', 
    email: 'bob@demo.com', 
    avatar: 'https://placehold.co/40x40/60a5fa/ffffff?text=B', 
    role: 'Member' 
  },
  { 
    id: 4, 
    name: 'Charlie', 
    email: 'charlie@demo.com', 
    avatar: 'https://placehold.co/40x40/34d399/ffffff?text=C', 
    role: 'Member' 
  },
  { 
    id: 5, 
    name: 'David', 
    email: 'david@demo.com', 
    avatar: 'https://placehold.co/40x40/facc15/ffffff?text=D', 
    role: 'Member' 
  },
];

export const mockRooms: Room[] = [
  { 
    id: 'public-101', 
    name: 'Trò chuyện chung', 
    lastMessage: 'David: Anyone here?', 
    unread: 5, 
    members: [1, 2, 3, 4, 5], 
    type: 'Public' 
  },
  { 
    id: 'private-201', 
    name: 'Nói chuyện với Alice', 
    lastMessage: 'You: I have submitted the report.', 
    unread: 0, 
    members: [1, 2], 
    type: 'Private' 
  },
  { 
    id: 'public-102', 
    name: 'Dự án "Titan"', 
    lastMessage: 'You: Let\'s have a meeting tomorrow.', 
    unread: 0, 
    members: [1, 2, 4, 5], 
    type: 'Public' 
  },
  { 
    id: 'private-202', 
    name: 'Nói chuyện với Bob', 
    lastMessage: 'Bob: OK, I will check it.', 
    unread: 2, 
    members: [1, 3], 
    type: 'Private' 
  },
];

export const mockMessages: Record<string, ChatMessage[]> = {
  'private-202': [
    { userId: 3, text: 'Hi, can we discuss the new design?', time: '10:31 AM' },
    { userId: 1, text: 'Sure, I am available now.', time: '10:32 AM' },
    { userId: 3, text: 'OK, I will check it.', time: '10:35 AM' },
  ],
  'public-101': [
    { userId: 4, text: 'Hello everyone!', time: 'Yesterday' },
    { userId: 5, text: 'Anyone here?', time: 'Yesterday' },
  ]
};
