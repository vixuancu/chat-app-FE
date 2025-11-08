import { useEffect, useRef } from 'react';
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

    // Use custom hooks for data management - pass socket for real-time updates
    const { socket, connectOnce } = useWebSocket();
    const { 
        rooms, 
        selectedRoom, 
        selectRoom, 
        loadRooms,
        markRoomAsRead,
        updateRoomLastMessage // 🆕 Get this function
    } = useRooms({ socket });

    const { 
        messages, 
        sendMessage: apiSendMessage, 
        loadRoomMessages,
        loadMoreMessages, // 🆕 NEW
        hasMore, // 🆕 NEW
        isLoading, // 🆕 NEW
        joinRoom,
        leaveRoom,
        isConnected,
        onNewMessage, // 🆕 NEW: Get callback registration function
    } = useMessages();

    // 🆕 Connect useMessages to useRooms for last_message updates
    // Use ref to keep latest updateRoomLastMessage without re-registering
    const updateRoomLastMessageRef = useRef(updateRoomLastMessage);
    updateRoomLastMessageRef.current = updateRoomLastMessage;

    // Register callback ONCE on mount (before WebSocket connects)
    useEffect(() => {
        console.log("🔗 [MainApp] Registering new message callback via useMessages");
        onNewMessage((message) => {
            console.log(`🔔 [MainApp] New message from useMessages - calling updateRoomLastMessage`);
            updateRoomLastMessageRef.current(message.room_id, message);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps = run once on mount
    
    // 🔧 Connect WebSocket once when app starts
    useEffect(() => {
        console.log("🌐 [MainApp] Connecting WebSocket once for user:", currentUser?.user_fullname);
        
        // Connect WebSocket once - it will stay connected for the whole session
        connectOnce();
        
        // ✅ useRooms already handles WebSocket events via socket listener
        // No need to manually update rooms here - let useRooms handle it
    }, [connectOnce, currentUser]);

    // ✅ Load rooms when component mounts
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
            
            // 1. Mark room as read when user views it
            markRoomAsRead(selectedRoom.room_id);
            
            // 2. Load message history from API (only once for history)
            loadRoomMessages(selectedRoom.room_id);
            
            // 3. Join room via WebSocket (for real-time updates)
            joinRoom(selectedRoom.room_id);
        }

        // Cleanup: leave previous room when changing rooms
        return () => {
            if (selectedRoom) {
                console.log("🚪 [MainApp] Leaving previous room:", selectedRoom.room_id);
                leaveRoom(selectedRoom.room_id);
            }
        };
    }, [selectedRoom, loadRoomMessages, joinRoom, leaveRoom, markRoomAsRead]);

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
                        socket={socket}
                        isLoadingMessages={isLoading}
                        hasMoreMessages={hasMore[selectedRoom.room_id] || false}
                        onLoadMoreMessages={() => loadMoreMessages(selectedRoom.room_id)}
                    />
                )}
            </main>
        </div>
    );
};
