import { useState } from 'react';
import { ModalBackdrop } from './ModalBackdrop';
import { roomsApi } from '@shared/services/api';
import toast from 'react-hot-toast';

interface CreateRoomModalProps {
    onClose: () => void;
    onRoomCreated?: () => void; // Callback to refresh room list
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ onClose, onRoomCreated }) => {
    const [roomName, setRoomName] = useState('');
    const [isDirectChat, setIsDirectChat] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!roomName.trim()) {
            toast.error('Vui lòng nhập tên phòng');
            return;
        }

        setIsLoading(true);
        try {
            const newRoom = await roomsApi.createRoom(roomName.trim(), isDirectChat);
            toast.success(`Tạo phòng "${newRoom.room_name}" thành công!`);
            
            // Notify parent to refresh room list
            onRoomCreated?.();
            
            onClose();
        } catch (error) {
            console.error('Error creating room:', error);
            toast.error('Không thể tạo phòng. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ModalBackdrop onClose={onClose}>
            <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Tạo phòng mới</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="room-name" className="block text-sm font-medium text-gray-700">
                            Tên phòng
                        </label>
                        <input
                            type="text"
                            id="room-name"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-hidden focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="room-type" className="block text-sm font-medium text-gray-700">
                            Loại phòng
                        </label>
                        <select
                            id="room-type"
                            value={isDirectChat ? 'direct' : 'group'}
                            onChange={(e) => setIsDirectChat(e.target.value === 'direct')}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-hidden focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="group">Group Chat (Nhóm)</option>
                            <option value="direct">Direct Chat (1-1)</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Đang tạo...' : 'Tạo'}
                        </button>
                    </div>
                </form>
            </div>
        </ModalBackdrop>
    );
};
