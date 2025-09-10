import { useState } from 'react';
import { Header } from './Header';
import { RoomList } from '@/components/chat/RoomList';
import { CreateRoomModal } from '@/components/modals/CreateRoomModal';
import { RoomMembersModal } from '@/components/modals/RoomMembersModal';
import { UserManagementModal } from '@/components/modals/UserManagementModal';
import { RoomManagementModal } from '@/components/modals/RoomManagementModal';
import type { User, Room } from '@/services/types';

interface SidebarProps {
    currentUser: User;
    rooms: Room[];
    users: User[];
    currentRoom: Room | null;
    onSelectRoom: (roomId: string) => void;
    onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    currentUser,
    rooms,
    users,
    currentRoom,
    onSelectRoom,
    onLogout
}) => {
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [showRoomMembers, setShowRoomMembers] = useState(false);
    const [showUserManagement, setShowUserManagement] = useState(false);
    const [showRoomManagement, setShowRoomManagement] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    const handleShowMembers = (room: Room) => {
        setSelectedRoom(room);
        setShowRoomMembers(true);
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
                            className="w-full pl-4 pr-12 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                        />
                        <button className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-indigo-600">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </div>

                    {currentUser.role === 'Admin' && (
                        <div className="space-y-4">
                            <button
                                onClick={() => setShowUserManagement(true)}
                                className="w-full flex items-center justify-center py-2.5 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-2.278 1 1 0 0 0 0-1.414L18.25 12.16a1 1 0 0 0-1.414 0l-2.25 2.25a1 1 0 0 0 0 1.414Z" />
                                </svg>
                                Quản lí người dùng
                            </button>

                            <button
                                onClick={() => setShowRoomManagement(true)}
                                className="w-full flex items-center justify-center py-2.5 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 mr-2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                                </svg>
                                Quản lí phòng chat
                            </button>
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
                <CreateRoomModal onClose={() => setShowCreateRoom(false)} />
            )}

            {showRoomMembers && selectedRoom && (
                <RoomMembersModal
                    room={selectedRoom}
                    users={users}
                    onClose={() => setShowRoomMembers(false)}
                    zIndex={60}
                />
            )}

            {showUserManagement && (
                <UserManagementModal
                    users={users}
                    onClose={() => setShowUserManagement(false)}
                />
            )}

            {showRoomManagement && (
                <RoomManagementModal
                    rooms={rooms}
                    onClose={() => setShowRoomManagement(false)}
                    onShowMembers={handleShowMembers}
                />
            )}
        </>
    );
};