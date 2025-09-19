import { ModalBackdrop } from './ModalBackdrop';
import type { Room } from '../../services/types';

interface RoomManagementModalProps {
    rooms: Room[];
    onClose: () => void;
    onShowMembers: (room: Room) => void;
}

export const RoomManagementModal: React.FC<RoomManagementModalProps> = ({
    rooms,
    onClose,
    onShowMembers
}) => {
    return (
        <ModalBackdrop onClose={onClose}>
            <div className="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Quản lí phòng chat</h3>
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tên phòng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Số thành viên
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rooms.map(room => (
                                <tr key={room.room_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {room.room_name || 'Direct Chat'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {room.members?.length || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => onShowMembers(room)}
                                            className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-xs font-semibold"
                                        >
                                            Xem Thành Viên
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end pt-4 mt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </ModalBackdrop>
    );
};
