import { useEffect, useRef, useState } from 'react';
import { useChatStore, Message } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { messagesAPI, directMessagesAPI } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function ChatArea() {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const viewMode = useChatStore((state) => state.viewMode);
    const currentChannel = useChatStore((state) => state.currentChannel);
    const currentConversation = useChatStore((state) => state.currentConversation);
    const messages = useChatStore((state) => state.messages);
    const dmMessages = useChatStore((state) => state.dmMessages);
    const typingUsers = useChatStore((state) => state.typingUsers);
    const setMessages = useChatStore((state) => state.setMessages);
    const setDMMessages = useChatStore((state) => state.setDMMessages);
    const prependMessages = useChatStore((state) => state.prependMessages);
    const user = useAuthStore((state) => state.user);

    const activeMessages = viewMode === 'channel' ? messages : dmMessages;

    // Load messages when channel/conversation changes
    useEffect(() => {
        if (viewMode === 'channel' && currentChannel) {
            loadMessages();
        } else if (viewMode === 'dm' && currentConversation) {
            loadDMMessages();
        }
    }, [currentChannel, currentConversation, viewMode]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (activeMessages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeMessages]);

    const loadMessages = async () => {
        if (!currentChannel) return;

        try {
            const { data } = await messagesAPI.get(currentChannel._id, { limit: 50 });
            setMessages(data.messages);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const loadDMMessages = async () => {
        if (!currentConversation) return;

        try {
            const { data } = await directMessagesAPI.get(currentConversation._id, { limit: 50 });
            setDMMessages(data.messages);
        } catch (error) {
            console.error('Failed to load DM messages:', error);
        }
    };

    const loadMoreMessages = async () => {
        if (loadingMore || !hasMore || activeMessages.length === 0) return;

        setLoadingMore(true);
        try {
            const oldestMessage = activeMessages[0];

            if (viewMode === 'channel' && currentChannel) {
                const { data } = await messagesAPI.get(currentChannel._id, {
                    limit: 50,
                    before: oldestMessage._id
                });

                if (data.messages.length === 0) {
                    setHasMore(false);
                } else {
                    prependMessages(data.messages);
                }
            } else if (viewMode === 'dm' && currentConversation) {
                // Implement prepend for DMs if needed, for now just basic load
                // Note: chatStore needs prependDMMessages for this to work fully
            }
        } catch (error) {
            console.error('Failed to load more messages:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (container && container.scrollTop === 0) {
            loadMoreMessages();
        }
    };

    const getMessageTime = (createdAt: string) => {
        try {
            return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
        } catch {
            return '';
        }
    };

    const getUserInitial = (username: string) => {
        return username.charAt(0).toUpperCase();
    };

    const getUserColor = (userId: string) => {
        const colors = [
            'from-violet-500 to-purple-500',
            'from-blue-500 to-cyan-500',
            'from-emerald-500 to-teal-500',
            'from-orange-500 to-amber-500',
            'from-pink-500 to-rose-500',
            'from-indigo-500 to-blue-600'
        ];
        const index = userId.charCodeAt(0) % colors.length;
        return colors[index];
    };

    if (viewMode === 'channel' && !currentChannel) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-lg animate-scaleIn">
                    <div className="w-32 h-32 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl glow-purple backdrop-blur-sm border-2 border-[var(--border-light)]">
                        <span className="text-6xl">💬</span>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">
                        <span className="gradient-text">Welcome to Cosmic Chat</span>
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed">Select a channel from the sidebar to start messaging your team.</p>
                </div>
            </div>
        );
    }

    if (viewMode === 'dm' && !currentConversation) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-lg animate-scaleIn">
                    <p className="text-gray-400 text-lg leading-relaxed">Select a conversation to start messaging.</p>
                </div>
            </div>
        );
    }

    const headerTitle = viewMode === 'channel'
        ? currentChannel?.name
        : currentConversation?.participants.find(p => p._id !== user?._id)?.username;

    const headerSubtitle = viewMode === 'channel'
        ? currentChannel?.description
        : currentConversation?.participants.find(p => p._id !== user?._id)?.email;

    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
            {/* Header */}
            <div className="h-20 border-b-2 border-[var(--border)] px-8 flex items-center glass z-10 shrink-0 bg-[var(--surface)]/30">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 flex items-center justify-center border-2 border-[var(--primary)]/30">
                        <span className="text-[var(--primary)] text-2xl font-bold">
                            {viewMode === 'channel' ? '#' : '@'}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold flex items-center text-white">
                            {headerTitle}
                        </h2>
                        {headerSubtitle && (
                            <p className="text-sm text-gray-400 mt-0.5">{headerSubtitle}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
                {loadingMore && (
                    <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {activeMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10 opacity-60">
                        <div className="text-4xl mb-2">✨</div>
                        <p>No messages yet. Be the first to say hello!</p>
                    </div>
                )}

                {activeMessages.map((message, index) => {
                    const isOwnMessage = message.sender._id === user?._id;
                    const showAvatar = index === 0 || activeMessages[index - 1].sender._id !== message.sender._id;

                    return (
                        <div
                            key={message._id}
                            className={`flex items-start gap-4 animate-fadeIn ${showAvatar ? 'mt-6' : 'mt-1'} ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                        >
                            {showAvatar ? (
                                <div
                                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getUserColor(
                                        message.sender._id
                                    )} flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg ring-2 ring-white/10 transform hover:scale-110 transition-transform cursor-default`}
                                    title={message.sender.username}
                                >
                                    {getUserInitial(message.sender.username)}
                                </div>
                            ) : (
                                <div className="w-10 flex-shrink-0" />
                            )}

                            <div className={`flex-1 min-w-0 flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                {showAvatar && (
                                    <div className={`flex items-baseline gap-2 mb-1.5 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                                        <span className="font-semibold text-white text-sm">{message.sender.username}</span>
                                        <span
                                            className="text-xs text-gray-500"
                                            title={new Date(message.createdAt).toLocaleString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            })}
                                        >
                                            {getMessageTime(message.createdAt)}
                                        </span>
                                    </div>
                                )}
                                <div
                                    className={`inline-block px-5 py-3.5 rounded-2xl max-w-[85%] break-words text-[15px] leading-relaxed ${isOwnMessage
                                        ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white rounded-tr-md shadow-lg shadow-indigo-500/25'
                                        : 'bg-[var(--surface-light)] text-gray-100 rounded-tl-md border-2 border-[var(--border)] shadow-md hover:border-[var(--border-light)] transition-colors'
                                        }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                    <div className="flex items-center space-x-3 ml-14 mt-3 animate-fadeIn">
                        <div className="bg-[var(--surface-light)] px-5 py-3.5 rounded-2xl rounded-tl-md border-2 border-[var(--border)] flex items-center space-x-2 shadow-md">
                            <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                            <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                        <span className="text-xs text-gray-400 italic font-medium">
                            {typingUsers.length === 1
                                ? 'Someone is typing...'
                                : `${typingUsers.length} people are typing...`}
                        </span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
