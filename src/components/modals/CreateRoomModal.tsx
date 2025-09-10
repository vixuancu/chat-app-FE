import { useState } from 'react';
import { ModalBackdrop } from './ModalBackdrop';

interface CreateRoomModalProps {
    onClose: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ onClose }) => {
    const [roomName, setRoomName] = useState('');
    const [roomType, setRoomType] = useState('Công khai');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement room creation
        alert(`Tạo phòng: ${roomName} (${roomType})`);
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
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="room-type" className="block text-sm font-medium text-gray-700">
                            Loại phòng
                        </label>
                        <select
                            id="room-type"
                            value={roomType}
                            onChange={(e) => setRoomType(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option>Công khai</option>
                            <option>Riêng tư</option>
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
