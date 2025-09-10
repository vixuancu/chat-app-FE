import { useState } from 'react';
import { Sidebar } from './layout/Sidebar';
import { ChatWindow } from './chat/ChatWindow';
import { WelcomeScreen } from './WelcomeScreen';
import { mockRooms, mockMessages, mockUsers } from '../data/mockData';
import type { User, Room, ChatMessage } from '../services/types';

interface MainAppProps {
    currentUser: User;
    onLogout: () => void;
}

export const MainApp: React.FC<MainAppProps> = ({ currentUser, onLogout }) => {
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
    const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(mockMessages);

    const handleSelectRoom = (roomId: string) => {
        const room = mockRooms.find(r => r.id === roomId);
        if (room) {
            setCurrentRoom(room);
        }
    };

    const handleSendMessage = (text: string) => {
        if (text.trim() && currentRoom) {
            const newMessage: ChatMessage = {
                userId: currentUser.id,
                text: text.trim(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => ({
                ...prev,
                [currentRoom.id]: [...(prev[currentRoom.id] || []), newMessage]
            }));
        }
    };

    return (
        <div className="h-screen w-screen flex">
            <Sidebar
                currentUser={currentUser}
                rooms={mockRooms}
                users={mockUsers}
                currentRoom={currentRoom}
                onSelectRoom={handleSelectRoom}
                onLogout={onLogout}
            />

            <main className="flex-1 flex flex-col">
                {!currentRoom ? (
                    <WelcomeScreen />
                ) : (
                    <ChatWindow
                        room={currentRoom}
                        messages={messages[currentRoom.id] || []}
                        users={mockUsers}
                        currentUser={currentUser}
                        onSendMessage={handleSendMessage}
                    />
                )}
            </main>
        </div>
    );
};
