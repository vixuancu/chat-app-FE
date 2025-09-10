import type { User } from '@/services/types';
import { Avatar } from '@/components/ui/Avatar';

interface HeaderProps {
    currentUser: User;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
    return (
        <header className="p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-3">
                <Avatar name={currentUser.name} size="md" />
                <div>
                    <p className="font-semibold text-gray-800 text-sm">{currentUser.name}</p>
                    <p className="text-xs text-green-500">● Online</p>
                </div>
            </div>
            <button
                onClick={onLogout}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                    />
                </svg>
            </button>
        </header>
    );
};