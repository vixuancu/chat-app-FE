import { useState } from 'react';
import { ModalBackdrop } from './ModalBackdrop';

interface CreateRoomModalProps {
    onClose: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ onClose }) => {
    const [roomName, setRoomName] = useState('');
    const [isDirectChat, setIsDirectChat] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement room creation với backend API
        const roomData = {
            room_name: roomName,
            room_is_direct_chat: isDirectChat,
            room_code: Math.random().toString(36).substring(2, 8).toUpperCase() // Generate random 6-char code
        };
        alert(`Tạo phòng: ${roomName} (${isDirectChat ? 'Direct Chat' : 'Group Chat'})`);
        console.log('Room data for backend:', roomData);
        onClose();
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
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                            Tạo
                        </button>
                    </div>
                </form>
            </div>
        </ModalBackdrop>
    );
};
