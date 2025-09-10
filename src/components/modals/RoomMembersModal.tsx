import { ModalBackdrop } from './ModalBackdrop';
import type { Room, User } from '../../services/types';

interface RoomMembersModalProps {
    room: Room;
    users: User[];
    onClose: () => void;
}

export const RoomMembersModal: React.FC<RoomMembersModalProps> = ({ room, users, onClose }) => {
    const roomMembers = users.filter(user => room.members.includes(user.id));

    return (
        <ModalBackdrop onClose={onClose}>
            <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Thành viên: {room.name}</h3>
                <ul className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
                    {roomMembers.length > 0 ? (
                        roomMembers.map(member => (
                            <li key={member.id} className="flex items-center space-x-3 p-2">
                                <img
                                    src={member.avatar}
                                    alt={member.name}
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <p className="font-medium text-gray-800">{member.name}</p>
                                    <p className="text-sm text-gray-500">{member.email}</p>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">Phòng này không có thành viên.</p>
                    )}
                </ul>
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
