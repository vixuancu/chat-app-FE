import { useState } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import type { Room, ChatMessage, User } from '@shared/services/types';

interface ChatWindowProps {
    room: Room;
    messages: ChatMessage[];
    currentUser: User;
    onSendMessage: (text: string) => Promise<void>;
    isConnected?: boolean; // WebSocket connection status
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    room,
    messages,
    currentUser,
    onSendMessage,
    isConnected = false
}) => {
    const [showMembers, setShowMembers] = useState(false);

    return (
        <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shrink-0">
                <div>
                    <h2 className="font-semibold text-lg">{room.room_name || 'Direct Chat'}</h2>
                    <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-500">
                            {room.room_is_direct_chat ? 'Direct Chat' : 'Group Chat'} • {room.member_count ?? room.members?.length ?? 0} members
                        </p>
                        <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded ${
                            isConnected 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                        }`}>
                            <div className={`w-2 h-2 rounded-full ${
                                isConnected ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <span>{isConnected ? 'Online' : 'Offline'}</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Code: {room.room_code}</p>
                </div>
                <button
                    onClick={() => setShowMembers(!showMembers)}
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-indigo-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span>{room.member_count ?? room.members?.length ?? 0}</span>
                </button>
            </header>

            {/* Message List */}
            <MessageList
                messages={messages}
                currentUser={currentUser}
            />

            {/* Message Input */}
            <MessageInput 
                onSendMessage={onSendMessage} 
                disabled={!isConnected}
            />
        </div>
    );
};