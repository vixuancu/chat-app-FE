import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ModalBackdrop } from './ModalBackdrop';
import { roomsApi } from '@shared/services/api';
import toast from 'react-hot-toast';

interface CreateRoomModalProps {
    onClose: () => void;
    onRoomCreated?: () => void; // Callback to refresh room list
}

interface CreateRoomFormData {
    roomName: string;
    isDirectChat: boolean;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ onClose, onRoomCreated }) => {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateRoomFormData>({
        defaultValues: {
            roomName: '',
            isDirectChat: false,
        },
    });

    const onSubmit = async (data: CreateRoomFormData) => {
        setIsLoading(true);
        try {
            console.log('📝 [CreateRoomModal] Submitting:', {
                roomName: data.roomName.trim(),
                isDirectChat: data.isDirectChat,
                type: typeof data.isDirectChat
            });
            
            const newRoom = await roomsApi.createRoom(data.roomName.trim(), data.isDirectChat);
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="room-name" className="block text-sm font-medium text-gray-700">
                            Tên phòng
                        </label>
                        <input
                            type="text"
                            id="room-name"
                            {...register('roomName', {
                                required: 'Tên phòng là bắt buộc',
                                minLength: {
                                    value: 2,
                                    message: 'Tên phòng phải có ít nhất 2 ký tự',
                                },
                            })}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-hidden focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {errors.roomName && (
                            <p className="mt-1 text-sm text-red-600">{errors.roomName.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="room-type" className="block text-sm font-medium text-gray-700">
                            Loại phòng
                        </label>
                        <select
                            id="room-type"
                            {...register('isDirectChat', {
                                setValueAs: (v) => v === 'true' // ✅ Convert string to boolean
                            })}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-hidden focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="false">Group Chat (Nhóm)</option>
                            <option value="true">Direct Chat (1-1)</option>
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
                            disabled={isSubmitting || isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting || isLoading ? 'Đang tạo...' : 'Tạo'}
                        </button>
                    </div>
                </form>
            </div>
        </ModalBackdrop>
    );
};
