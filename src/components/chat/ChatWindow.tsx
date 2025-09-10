import { useState } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import type { Room, ChatMessage, User } from '../../services/types';

interface ChatWindowProps {
    room: Room;
    messages: ChatMessage[];
    users: User[];
    currentUser: User;
    onSendMessage: (text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    room,
    messages,
    users,
    currentUser,
    onSendMessage
}) => {
    const [showMembers, setShowMembers] = useState(false);

    return (
        <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
                <div>
                    <h2 className="font-semibold text-lg">{room.name}</h2>
                    <p className="text-sm text-gray-500">{room.type} Room • {room.members.length} members</p>
                    <p className="text-xs text-gray-400 mt-1">ID: {room.id}</p>
                </div>
                <button
                    onClick={() => setShowMembers(!showMembers)}
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span>{room.members.length}</span>
                </button>
            </header>

            {/* Message List */}
            <MessageList
                messages={messages}
                users={users}
                currentUser={currentUser}
            />

            {/* Message Input */}
            <MessageInput onSendMessage={onSendMessage} />
        </div>
    );
};