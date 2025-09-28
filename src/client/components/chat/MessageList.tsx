import { useEffect, useRef } from 'react';
import type { ChatMessage, User } from '@shared/services/types';
import { Avatar } from '@shared/components/ui/Avatar';

interface MessageListProps {
    messages: ChatMessage[];
    currentUser: User;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUser }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Sort messages by timestamp to ensure chronological order (oldest first, newest last)
    const sortedMessages = [...messages].sort((a, b) => {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    console.log("💬 [MessageList] Messages:", {
        originalCount: messages.length,
        sortedCount: sortedMessages.length,
        firstMessage: sortedMessages[0]?.content,
        lastMessage: sortedMessages[sortedMessages.length - 1]?.content
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [sortedMessages]); // Use sortedMessages instead of messages

    if (sortedMessages.length === 0) {
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
            {sortedMessages.map((message, index) => {
                // Use is_own if available, otherwise fallback to user_uuid comparison
                const isCurrentUser = message.is_own ?? (message.user_uuid === currentUser.user_uuid);

                return (
                    <div key={index} className={`flex items-start gap-3 my-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                        <Avatar name={message.user_fullname} size="sm" />
                        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-2 rounded-2xl ${isCurrentUser
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-white text-gray-800 rounded-bl-none'
                                }`}>
                                <p className="text-sm">{message.content}</p>
                            </div>
                            <span className="text-xs text-gray-400 mt-1">
                                {message.user_fullname} • {new Date(message.created_at).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};