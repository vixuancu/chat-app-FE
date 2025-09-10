import { useEffect, useRef } from 'react';
import type { ChatMessage, User } from '../../services/types';

interface MessageListProps {
    messages: ChatMessage[];
    users: User[];
    currentUser: User;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, users, currentUser }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 p-6 overflow-y-auto scrollbar-thin bg-gray-50 flex items-center justify-center">
                <p className="text-center text-gray-500 text-sm">
                    Chưa có tin nhắn nào. Bắt đầu cuộc trò chuyện!
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 overflow-y-auto scrollbar-thin bg-gray-50">
            {messages.map((message, index) => {
                const sender = users.find(u => u.id === message.userId);
                const isCurrentUser = sender?.id === currentUser.id;

                if (!sender) return null;

                return (
                    <div key={index} className={`flex items-start gap-3 my-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                        <img
                            src={sender.avatar}
                            alt={sender.name}
                            className="w-8 h-8 rounded-full"
                        />
                        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-2 rounded-2xl ${isCurrentUser
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none'
                                }`}>
                                <p className="text-sm">{message.text}</p>
                            </div>
                            <span className="text-xs text-gray-400 mt-1">
                                {sender.name} • {message.time}
                            </span>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};