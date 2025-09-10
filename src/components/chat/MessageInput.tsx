import { useState } from 'react';

interface MessageInputProps {
    onSendMessage: (text: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (message.trim()) {
                onSendMessage(message.trim());
                setMessage('');
            }
        }
    };

    return (
        <footer className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn của bạn..."
                    className="w-full pl-4 pr-16 py-3 text-sm bg-gray-100 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <button
                        type="submit"
                        disabled={!message.trim()}
                        className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Gửi
                    </button>
                </div>
            </form>
        </footer>
    );
};