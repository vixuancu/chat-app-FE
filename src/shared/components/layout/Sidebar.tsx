import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Header } from './Header';
import { RoomList } from '@client/components/chat/RoomList';
import { CreateRoomModal } from '@shared/components/modals/CreateRoomModal';
import { roomsApi } from '@shared/services/api';
import type { User, Room } from '@shared/services/types';

interface SidebarProps {
    currentUser: User;
    rooms: Room[];
    currentRoom: Room | null;
    onSelectRoom: (roomId: string) => void;
    onLogout: () => void;
    onRefreshRooms?: () => void; // Add refresh callback
}

export const Sidebar: React.FC<SidebarProps> = ({
    currentUser,
    rooms,
    currentRoom,
    onSelectRoom,
    onLogout,
    onRefreshRooms
}) => {
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [roomCode, setRoomCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const handleJoinByCode = async () => {
        if (!roomCode.trim()) {
            toast.error('Vui lòng nhập mã phòng');
            return;
        }

        setIsJoining(true);
        try {
            console.log('🚀 [Sidebar] Joining room with code:', roomCode);
            const room = await roomsApi.joinRoomByCode(roomCode.trim());
            console.log('✅ [Sidebar] Joined room successfully:', room);
            
            toast.success(`Tham gia phòng "${room.room_name}" thành công!`);
            setRoomCode(''); // Clear input
            
            // Refresh room list and select the new room
            onRefreshRooms?.();
            if (room.room_id) {
                onSelectRoom(room.room_id.toString());
            }
        } catch (error: unknown) {
            console.error('❌ [Sidebar] Error joining room:', error);
            
            let errorMessage = 'Không thể tham gia phòng';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } } };
                errorMessage = axiosError.response?.data?.message || errorMessage;
            }
            
            toast.error(errorMessage);
        } finally {
            setIsJoining(false);
        }
    };

    const handleJoinKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleJoinByCode();
        }
    };

    return (
        <>
            <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <Header
                    currentUser={currentUser}
                    onLogout={onLogout}
                />

                {/* Actions */}
                <div className="p-4 space-y-4 border-b border-gray-200">
                    <button
                        onClick={() => setShowCreateRoom(true)}
                        className="w-full flex items-center justify-center py-2.5 px-4 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Tạo phòng mới
                    </button>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tham gia bằng mã..."
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                            onKeyPress={handleJoinKeyPress}
                            disabled={isJoining}
                            className="w-full pl-4 pr-12 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button 
                            onClick={handleJoinByCode}
                            disabled={isJoining || !roomCode.trim()}
                            className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isJoining ? (
                                <svg className="size-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {currentUser.user_role === 'Admin' && (
                        <div className="space-y-2">
                            <Link
                                to="/admin/dashboard"
                                className="w-full flex items-center justify-center py-2.5 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m0 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m6-6h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                                </svg>
                                Bảng điều khiển Admin
                            </Link>
                        </div>
                    )}
                </div>

                <RoomList
                    rooms={rooms}
                    currentRoom={currentRoom}
                    onSelectRoom={onSelectRoom}
                />
            </aside>

            {/* Modals */}
            {showCreateRoom && (
                <CreateRoomModal 
                    onClose={() => setShowCreateRoom(false)} 
                    onRoomCreated={onRefreshRooms}
                />
            )}
        </>
    );
};