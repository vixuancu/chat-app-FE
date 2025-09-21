import { ModalBackdrop } from './ModalBackdrop';
import type { User } from '@shared/services/types';
import { Avatar } from '@shared/components/ui/Avatar';

interface UserManagementModalProps {
    users: User[];
    onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ users, onClose }) => {
    return (
        <ModalBackdrop onClose={onClose}>
            <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Quản lí người dùng</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tên
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.user_uuid}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="shrink-0">
                                                <Avatar name={user?.user_fullname} size="md" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user?.user_fullname}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.user_email}
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
