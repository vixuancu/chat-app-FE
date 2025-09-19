import { ModalBackdrop } from './ModalBackdrop';
import type { Room, User } from '@/services/types';
import { Avatar } from '@/components/ui/Avatar';

interface RoomMembersModalProps {
    room: Room;
    users: User[];
    onClose: () => void;
    zIndex?: number;
}

export const RoomMembersModal: React.FC<RoomMembersModalProps> = ({ room, users, onClose, zIndex }) => {
    const roomMembers = users.filter(user =>
        room.members?.includes(user.user_uuid)
    );

    return (
        <ModalBackdrop onClose={onClose} zIndex={zIndex}>
            <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Thành viên: {room.room_name || 'Direct Chat'}</h3>
                <ul className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
                    {roomMembers.length > 0 ? (
                        roomMembers.map(member => (
                            <li key={member.user_uuid} className="flex items-center space-x-3 p-2">
                                <Avatar name={member?.user_fullname} size="md" />
                                <div>
                                    <p className="font-medium text-gray-800">{member?.user_fullname}</p>
                                    <p className="text-sm text-gray-500">{member.user_email}</p>
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
