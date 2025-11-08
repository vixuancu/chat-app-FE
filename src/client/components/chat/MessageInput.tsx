import { useState } from 'react';
import { useTypingIndicator } from '@shared/hooks/useTypingIndicator';

interface MessageInputProps {
    onSendMessage: (text: string) => Promise<void>;
    disabled?: boolean; // Disable input when WebSocket disconnected
    roomId: number; // Phase 2.2: Room ID for typing indicator
    socket: WebSocket | null; // Phase 2.2: WebSocket for typing indicator
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
    onSendMessage, 
    disabled = false,
    roomId,
    socket
}) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Phase 2.2: Typing indicator
    const { typingUsers, notifyTyping } = useTypingIndicator({ roomId, socket });

    const MAX_MESSAGE_LENGTH = 2000; // Match backend validation
    const remainingChars = MAX_MESSAGE_LENGTH - message.length;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!message.trim() || disabled || isSending || message.length > MAX_MESSAGE_LENGTH) {
            return;
        }

        setIsSending(true);
        try {
            await onSendMessage(message.trim());
            setMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="p-4 bg-white">
            {/* Phase 2.2: Typing indicator display */}
            {typingUsers.length > 0 && (
                <div className="text-sm text-gray-500 px-4 pb-2 italic">
                    {typingUsers.length === 1 
                        ? `${typingUsers[0]} đang nhập...`
                        : typingUsers.length === 2
                        ? `${typingUsers[0]} và ${typingUsers[1]} đang nhập...`
                        : `${typingUsers[0]}, ${typingUsers[1]} và ${typingUsers.length - 2} người khác đang nhập...`
                    }
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            // Phase 2.2: Notify typing when user types
                            if (e.target.value.trim()) {
                                notifyTyping();
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        disabled={disabled || isSending}
                        maxLength={MAX_MESSAGE_LENGTH}
                        placeholder={
                            disabled 
                                ? "Đang kết nối..." 
                                : isSending 
                                ? "Đang gửi..." 
                                : "Aa"
                        }
                        className={`w-full pl-4 pr-20 py-3 text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed border-0 resize-none ${
                            message.length > MAX_MESSAGE_LENGTH - 100 ? 'ring-2 ring-orange-300' : ''
                        } ${message.length >= MAX_MESSAGE_LENGTH ? 'ring-2 ring-red-300' : ''} transition-all duration-200`}
                    />
                    
                    {/* Character counter */}
                    {message.length > MAX_MESSAGE_LENGTH - 200 && (
                        <div className={`absolute -top-6 right-0 text-xs ${
                            remainingChars < 50 ? 'text-red-500' : remainingChars < 100 ? 'text-orange-500' : 'text-gray-500'
                        }`}>
                            {remainingChars} ký tự còn lại
                        </div>
                    )}
                    
                    {/* Send button */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <button
                            type="submit"
                            disabled={!message.trim() || disabled || isSending || message.length > MAX_MESSAGE_LENGTH}
                            className="w-8 h-8 flex items-center justify-center text-white bg-blue-500 rounded-full hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 disabled:hover:bg-blue-500"
                        >
                            {isSending ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};