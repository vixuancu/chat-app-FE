import type { Room } from '@shared/services/types';
import { ChatUtils } from '@shared/utils/chatUtils';
import { storage } from '@shared/utils/storage';

interface RoomListProps {
    rooms: Room[];
    currentRoom: Room | null;
    onSelectRoom: (roomId: string) => void;
}

export const RoomList: React.FC<RoomListProps> = ({ 
    rooms, 
    currentRoom, 
    onSelectRoom
}) => {
    // Get current user for message validation
    const currentUser = storage.getUser();
    
    // Debug logging để check rooms data
    console.log("🏠 [RoomList] Received rooms with backend last_message:", rooms);
    console.log("👤 [RoomList] Current user:", currentUser?.user_uuid);
    
    // ✅ Helper function using ChatUtils for proper validation
    const getLastMessage = (room: Room): string => {
        if (!currentUser) return 'Chưa có tin nhắn nào';
        
        // Use ChatUtils to validate and format message
        let message = ChatUtils.formatLastMessage(room, currentUser);
        
        // 🆕 Truncate to 20 characters max with "..."
        if (message.length > 20) {
            message = message.substring(0, 25) + '...';
        }
        
        return message;
    };
    
    // ✅ Helper function for time formatting
    const getLastMessageTime = (room: Room): string => {
        if (!ChatUtils.hasValidLastMessage(room)) {
            return '';
        }
        
        return ChatUtils.formatTime(room.last_message!.created_at);
    };
    
    rooms?.forEach(room => {
        console.log(`📊 [RoomList] Room ${room.room_name}:`, {
            room_id: room.room_id,
            member_count: room.member_count,
            last_message: room.last_message,
            displayMessage: getLastMessage(room),
            displayTime: getLastMessageTime(room),
        });
    });

     // ✅ Guard clause để tránh lỗi khi rooms undefined
    if (!rooms || !Array.isArray(rooms)) {
        return (
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Phòng Chat
                </h3>
                <div className="flex items-center justify-center p-8">
                    <p className="text-sm text-gray-500">Đang tải phòng chat...</p>
                </div>
            </nav>
        );
    }
    return (
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Phòng Chat
            </h3>
            <ul className="space-y-1">
                {rooms.map(room => (
                    <li
                        key={room.room_id}
                        onClick={() => onSelectRoom(room.room_id.toString())}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-indigo-50 ${currentRoom?.room_id === room.room_id ? 'bg-indigo-100' : ''
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-indigo-600">
                                {(room.room_name || 'Chat').charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{room.room_name || 'Direct Chat'}</p>
                                    <span className="text-xs text-gray-400">{getLastMessageTime(room)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className={`text-xs truncate ${
                                        !ChatUtils.hasValidLastMessage(room)
                                            ? 'text-gray-400 italic'
                                            : room.unread && room.unread > 0
                                            ? 'text-gray-900 font-semibold' // ✅ Tin chưa đọc: Màu đen + bold
                                            : 'text-gray-500' // Tin đã đọc: Màu xám
                                    }`}>
                                        {getLastMessage(room)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {room.unread && room.unread > 0 && (
                            <span className="bg-indigo-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                {room.unread}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
};