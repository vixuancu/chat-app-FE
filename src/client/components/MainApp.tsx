import { useEffect } from 'react';
import { Sidebar } from '@shared/components/layout/Sidebar';
import { ChatWindow } from './chat/ChatWindow';
import { WelcomeScreen } from './WelcomeScreen';
import { useRooms } from '@shared/hooks/useRooms';
import { useMessages } from '@shared/hooks/useMessages';
import { useWebSocket } from '@shared/hooks/useWebSocket';
// AdminApi removed - user data now embedded in messages
import type { User } from '@shared/services/types';

interface MainAppProps {
    currentUser: User;
    onLogout: () => void;
}

export const MainApp: React.FC<MainAppProps> = ({ currentUser, onLogout }) => {
    // Users data is now included in messages, no need for separate user list

    // Use custom hooks for data management
    const { rooms, selectedRoom, selectRoom, loadRooms, setRooms } = useRooms();
    const { connectOnce, onRoomUpdate } = useWebSocket();

    const { 
        messages, 
        sendMessage: apiSendMessage, 
        loadRoomMessages,
        joinRoom,
        leaveRoom,
        isConnected 
    } = useMessages();

    // 🔧 NEW LOGIC: Connect WebSocket once when app starts
    useEffect(() => {
        console.log("🌐 [MainApp] Connecting WebSocket once for user:", currentUser?.user_fullname);
        
        // Connect WebSocket once - it will stay connected for the whole session
        connectOnce();
        
        // Listen for room updates
        onRoomUpdate((roomId, lastMessage) => {
            console.log(`🔄 Room ${roomId} has a new message:`, lastMessage);
            
            // Update room's last_message when new message arrives
            setRooms(prev => 
                prev.map(room => {
                    if (room.room_id === roomId) {
                        return {
                            ...room,
                            last_message: {
                                message_id: lastMessage.message_id,
                                content: lastMessage.content,
                                sender_name: lastMessage.user_fullname,
                                sender_uuid: lastMessage.user_uuid,
                                created_at: lastMessage.created_at,
                                is_own: lastMessage.user_uuid === currentUser?.user_uuid
                            }
                        };
                    }
                    return room;
                })
            );
        });
    }, [connectOnce, onRoomUpdate, currentUser, setRooms]);

    // ✅ Load rooms when component mounts - THIS WAS MISSING!
    useEffect(() => {
        console.log("🏁 [MainApp] Initializing - loading rooms...");
        loadRooms();
    }, [loadRooms]);

    // Load users data (for admin or display purposes)
    // Users data is now included in message responses, no separate loading needed

    // 🔧 NEW LOGIC: Join/leave rooms via WebSocket events, don't reconnect
    useEffect(() => {
        if (selectedRoom) {
            console.log("🏠 [MainApp] Room selected:", selectedRoom.room_name);
            
            // 1. Load message history from API (only once for history)
            loadRoomMessages(selectedRoom.room_id);
            
            // 2. Join room via WebSocket (for real-time updates)
            joinRoom(selectedRoom.room_id);
        }

        // Cleanup: leave previous room when changing rooms
        return () => {
            if (selectedRoom) {
                console.log("🚪 [MainApp] Leaving previous room:", selectedRoom.room_id);
                leaveRoom(selectedRoom.room_id);
            }
        };
    }, [selectedRoom, loadRoomMessages, joinRoom, leaveRoom]);

    const handleSelectRoom = (roomId: string) => {
        const room = rooms.find(r => r.room_id === parseInt(roomId));
        if (room) {
            selectRoom(room);
        }
    };

    const handleSendMessage = async (text: string): Promise<void> => {
        if (!text.trim() || !selectedRoom) return;

        try {
            await apiSendMessage(selectedRoom.room_id, text.trim());
        } catch (error) {
            console.error('Failed to send message:', error);
            // The error will be handled in MessageInput through the promise rejection
            throw error;
        }
    };

    return (
        <div className="h-screen w-screen flex">
            <Sidebar
                currentUser={currentUser}
                rooms={rooms}
                currentRoom={selectedRoom}
                onSelectRoom={handleSelectRoom}
                onLogout={onLogout}
                onRefreshRooms={loadRooms}
            />

            <main className="flex-1 flex flex-col">
                {!selectedRoom ? (
                    <WelcomeScreen />
                ) : (
                    <ChatWindow
                        room={selectedRoom}
                        messages={messages[selectedRoom.room_id] || []}
                        currentUser={currentUser}
                        onSendMessage={handleSendMessage}
                        isConnected={isConnected}
                    />
                )}
            </main>
        </div>
    );
};
