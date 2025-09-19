import { useState, useEffect } from 'react';
import { Sidebar } from './layout/Sidebar';
import { ChatWindow } from './chat/ChatWindow';
import { WelcomeScreen } from './WelcomeScreen';
import { useRooms } from '@/hooks/useRooms';
import { useMessages } from '@/hooks/useMessages';
import { adminApi } from '@/services/api';
import type { User } from '../services/types';

interface MainAppProps {
    currentUser: User;
    onLogout: () => void;
}

export const MainApp: React.FC<MainAppProps> = ({ currentUser, onLogout }) => {
    const [allUsers, setAllUsers] = useState<User[]>([]);

    // Use custom hooks for data management
    const { rooms, selectedRoom, selectRoom } = useRooms();
    const { messages, sendMessage: apiSendMessage, loadRoomMessages } = useMessages();

    // Load users data (for admin or display purposes)
    useEffect(() => {
        const loadUsers = async () => {
            if (currentUser.user_role === 'Admin') {
                try {
                    const users = await adminApi.getAllUsers();
                    setAllUsers(users);
                } catch (error) {
                    console.error('Failed to load users:', error);
                    setAllUsers([currentUser]); // At least include current user
                }
            } else {
                setAllUsers([currentUser]); // Regular users only see themselves
            }
        };

        loadUsers();
    }, [currentUser]);

    // Load messages when room is selected
    useEffect(() => {
        if (selectedRoom) {
            loadRoomMessages(selectedRoom.room_id);
        }
    }, [selectedRoom, loadRoomMessages]);

    const handleSelectRoom = (roomId: string) => {
        const room = rooms.find(r => r.room_id === parseInt(roomId));
        if (room) {
            selectRoom(room);
        }
    };

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || !selectedRoom) return;

        try {
            await apiSendMessage(selectedRoom.room_id, text.trim());
        } catch (error) {
            console.error('Failed to send message:', error);
            // Could show error notification here
        }
    };

    return (
        <div className="h-screen w-screen flex">
            <Sidebar
                currentUser={currentUser}
                rooms={rooms}
                users={allUsers}
                currentRoom={selectedRoom}
                onSelectRoom={handleSelectRoom}
                onLogout={onLogout}
            />

            <main className="flex-1 flex flex-col">
                {!selectedRoom ? (
                    <WelcomeScreen />
                ) : (
                    <ChatWindow
                        room={selectedRoom}
                        messages={messages[selectedRoom.room_id] || []}
                        users={allUsers}
                        currentUser={currentUser}
                        onSendMessage={handleSendMessage}
                    />
                )}
            </main>
        </div>
    );
};
