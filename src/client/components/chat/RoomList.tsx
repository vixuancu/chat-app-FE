import type { Room } from '@shared/services/types';

interface RoomListProps {
    rooms: Room[];
    currentRoom: Room | null;
    onSelectRoom: (roomId: string) => void;
}

export const RoomList: React.FC<RoomListProps> = ({ rooms, currentRoom, onSelectRoom }) => {
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
                                <p className="text-sm font-semibold text-gray-800 truncate">{room.room_name || 'Direct Chat'}</p>
                                <p className="text-xs text-gray-500 truncate">{room.lastMessage}</p>
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