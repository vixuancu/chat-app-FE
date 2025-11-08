import { useEffect, useRef, useState } from 'react';
import type { ChatMessage, User } from '@shared/services/types';
import { Avatar } from '@shared/components/ui/Avatar';

interface MessageListProps {
    messages: ChatMessage[];
    currentUser: User;
    isLoading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({ 
    messages, 
    currentUser,
    isLoading = false,
    hasMore = false,
    onLoadMore
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
    const previousScrollHeight = useRef<number>(0);

    // Sort messages by timestamp to ensure chronological order (oldest first, newest last)
    const sortedMessages = [...messages].sort((a, b) => {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    console.log("💬 [MessageList] Messages:", {
        originalCount: messages.length,
        sortedCount: sortedMessages.length,
        firstMessage: sortedMessages[0]?.content,
        lastMessage: sortedMessages[sortedMessages.length - 1]?.content,
        hasMore,
        isLoading
    });

    // 🆕 Infinite Scroll: Detect scroll to top
    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        
        // Check if user is near bottom (within 100px)
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShouldScrollToBottom(isNearBottom);

        // 🚀 Load more when scroll to top (within 50px)
        if (scrollTop < 50 && hasMore && !isLoading && onLoadMore) {
            console.log("🔄 [MessageList] Loading more messages...");
            previousScrollHeight.current = scrollHeight;
            onLoadMore();
        }
    };

    // Scroll to bottom on first load or new message (only if user is near bottom)
    useEffect(() => {
        if (shouldScrollToBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [sortedMessages, shouldScrollToBottom]);

    // 🆕 Maintain scroll position after loading older messages
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || previousScrollHeight.current === 0) return;

        const newScrollHeight = container.scrollHeight;
        const scrollDiff = newScrollHeight - previousScrollHeight.current;
        
        if (scrollDiff > 0) {
            // Restore scroll position (don't jump to top)
            container.scrollTop += scrollDiff;
            console.log("📍 [MessageList] Maintained scroll position after load");
        }
        
        previousScrollHeight.current = 0;
    }, [messages.length]);

    if (sortedMessages.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-6">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Chưa có tin nhắn nào</p>
                    <p className="text-gray-400 text-xs mt-1">Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên!</p>
                </div>
            </div>
        );
    }

    return (
        <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto scrollbar-thin smooth-scroll bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-2"
        >
            {/* 🆕 Loading indicator at top */}
            {isLoading && (
                <div className="flex justify-center py-4">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                        <span className="text-sm text-gray-600">Đang tải...</span>
                    </div>
                </div>
            )}

            {/* 🆕 "Load more" button (optional, if hasMore but not auto-loading) */}
            {hasMore && !isLoading && (
                <div className="flex justify-center py-2">
                    <button
                        onClick={onLoadMore}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium bg-white/60 hover:bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 transition-colors shadow-sm"
                    >
                        ↑ Tải tin nhắn cũ hơn
                    </button>
                </div>
            )}
            <div className="max-w-4xl mx-auto">
                {sortedMessages.map((message, index) => {
                    // Use is_own if available, otherwise fallback to user_uuid comparison
                    const isCurrentUser = message.is_own ?? (message.user_uuid === currentUser.user_uuid);
                    
                    // Check if this message is from the same user as the previous message
                    const prevMessage = sortedMessages[index - 1];
                    const isSameUserAsPrevious = prevMessage && prevMessage.user_uuid === message.user_uuid;
                    
                    // Check if this message was sent within 2 minutes of the previous message
                    const isWithinTimeGroup = prevMessage && 
                        (new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime()) < 2 * 60 * 1000;
                    
                    const showAvatar = !isSameUserAsPrevious || !isWithinTimeGroup;
                    const marginTop = showAvatar ? 'mt-4' : 'mt-1';

                    return (
                        <div key={index} className={`flex items-end gap-2 ${marginTop} ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar - only show for first message in group */}
                            <div className={`flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}>
                                <Avatar name={message.user_fullname} size="sm" />
                            </div>
                            
                            {/* Message bubble */}
                            <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl`}>
                                {/* Show sender name only for first message in group and not for current user */}
                                {showAvatar && !isCurrentUser && (
                                    <span className="text-xs text-gray-500 mb-1 px-3">
                                        {message.user_fullname}
                                    </span>
                                )}
                                
                                <div className={`px-4 py-2 rounded-2xl break-words ${
                                    isCurrentUser
                                        ? 'bg-blue-500 text-white rounded-br-md'
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                                } ${!showAvatar ? (isCurrentUser ? 'rounded-br-2xl' : 'rounded-bl-2xl') : ''}`}>
                                    <p className="text-sm leading-relaxed">{message.content}</p>
                                    
                                    {/* Phase 1.3: Message status indicator (only for own messages) */}
                                    {isCurrentUser && message.status && (
                                        <span className="text-xs ml-2 inline-block" title={message.status}>
                                            {message.status === 'sending'}
                                            {message.status === 'sent' }
                                            {message.status === 'error' && '❌'}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Timestamp - only show for last message in group or after 5 minutes */}
                                {(!sortedMessages[index + 1] || 
                                  sortedMessages[index + 1].user_uuid !== message.user_uuid ||
                                  (sortedMessages[index + 1] && 
                                   (new Date(sortedMessages[index + 1].created_at).getTime() - new Date(message.created_at).getTime()) > 5 * 60 * 1000)
                                ) && (
                                    <span className="text-xs text-gray-400 mt-1 px-1">
                                        {new Date(message.created_at).toLocaleTimeString('vi-VN', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
                
                {/* Scroll anchor */}
                <div ref={messagesEndRef} className="h-4" />
            </div>
        </div>
    );
};