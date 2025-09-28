import { useState } from 'react';

interface MessageInputProps {
    onSendMessage: (text: string) => Promise<void>;
    disabled?: boolean; // Disable input when WebSocket disconnected
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
    onSendMessage, 
    disabled = false 
}) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

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
        <footer className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled || isSending}
                        maxLength={MAX_MESSAGE_LENGTH}
                        placeholder={
                            disabled 
                                ? "Đang kết nối..." 
                                : isSending 
                                ? "Đang gửi..." 
                                : "Nhập tin nhắn của bạn..."
                        }
                        className={`w-full pl-4 pr-16 py-3 text-sm bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                            message.length > MAX_MESSAGE_LENGTH - 100 ? 'border-orange-300' : ''
                        } ${message.length >= MAX_MESSAGE_LENGTH ? 'border-red-300' : ''}`}
                    />
                    
                    {/* Character counter */}
                    {message.length > MAX_MESSAGE_LENGTH - 200 && (
                        <div className={`absolute -top-6 right-0 text-xs ${
                            remainingChars < 50 ? 'text-red-500' : remainingChars < 100 ? 'text-orange-500' : 'text-gray-500'
                        }`}>
                            {remainingChars} ký tự còn lại
                        </div>
                    )}
                </div>
                
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <button
                        type="submit"
                        disabled={!message.trim() || disabled || isSending || message.length > MAX_MESSAGE_LENGTH}
                        className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSending ? (
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Gửi</span>
                            </div>
                        ) : (
                            'Gửi'
                        )}
                    </button>
                </div>
            </form>
        </footer>
    );
};