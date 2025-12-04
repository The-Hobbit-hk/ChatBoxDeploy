'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import socketClient from '@/lib/socket';
import EmojiPickerButton from './EmojiPickerButton';

export default function MessageInput() {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const viewMode = useChatStore((state) => state.viewMode);
    const currentChannel = useChatStore((state) => state.currentChannel);
    const currentConversation = useChatStore((state) => state.currentConversation);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleTyping = () => {
        if (viewMode === 'channel' && !currentChannel) return;
        if (viewMode === 'dm' && !currentConversation) return;

        if (!isTyping) {
            setIsTyping(true);
            if (viewMode === 'channel' && currentChannel) {
                socketClient.emit('typing', { channelId: currentChannel._id, isTyping: true });
            } else if (viewMode === 'dm' && currentConversation) {
                socketClient.emit('typing_dm', { conversationId: currentConversation._id, isTyping: true });
            }
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            if (viewMode === 'channel' && currentChannel) {
                socketClient.emit('typing', { channelId: currentChannel._id, isTyping: false });
            } else if (viewMode === 'dm' && currentConversation) {
                socketClient.emit('typing_dm', { conversationId: currentConversation._id, isTyping: false });
            }
        }, 1000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) return;
        if (viewMode === 'channel' && !currentChannel) return;
        if (viewMode === 'dm' && !currentConversation) return;

        if (viewMode === 'channel' && currentChannel) {
            socketClient.emit('send_message', {
                channelId: currentChannel._id,
                content: message.trim()
            });
        } else if (viewMode === 'dm' && currentConversation) {
            socketClient.emit('send_direct_message', {
                conversationId: currentConversation._id,
                content: message.trim()
            });
        }

        setMessage('');
        setIsTyping(false);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (viewMode === 'channel' && currentChannel) {
            socketClient.emit('typing', { channelId: currentChannel._id, isTyping: false });
        } else if (viewMode === 'dm' && currentConversation) {
            socketClient.emit('typing_dm', { conversationId: currentConversation._id, isTyping: false });
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newMessage = message.substring(0, start) + emoji + message.substring(end);

        setMessage(newMessage);

        // Set cursor position after emoji
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + emoji.length, start + emoji.length);
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    if (viewMode === 'channel' && !currentChannel) return null;
    if (viewMode === 'dm' && !currentConversation) return null;

    const placeholder = viewMode === 'channel'
        ? `Message #${currentChannel?.name}`
        : `Message @${currentConversation?.participants.find(p => p.username !== 'You')?.username || 'User'}`; // Simplified for now

    return (
        <div className="p-6 pt-3 pb-6 glass border-t-2 border-[var(--border)] z-20 bg-[var(--surface)]/40">
            <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
                <div className="relative group">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            handleTyping();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="w-full pl-6 pr-16 py-4 rounded-2xl bg-[var(--surface-light)] border-2 border-[var(--border)] text-white resize-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder-gray-500 shadow-inner font-medium"
                        rows={1}
                        style={{
                            minHeight: '64px',
                            maxHeight: '200px',
                            height: 'auto'
                        }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!message.trim()}
                        className="absolute right-3 bottom-3 p-3 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-0.5 hover:scale-105 active:translate-y-0 active:scale-100 glow-primary"
                        title="Send message"
                    >
                        <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                    <div className="absolute right-16 bottom-3">
                        <EmojiPickerButton onEmojiSelect={handleEmojiSelect} />
                    </div>
                </div>
                <div className="flex justify-between items-center mt-2.5 px-2">
                    <p className="text-xs text-gray-500 font-medium">
                        <kbd className="px-1.5 py-0.5 bg-[var(--surface-lighter)] rounded text-xs border border-[var(--border)]">Enter</kbd> to send ·
                        <kbd className="px-1.5 py-0.5 bg-[var(--surface-lighter)] rounded text-xs border border-[var(--border)] ml-1">Shift + Enter</kbd> for new line
                    </p>
                </div>
            </form>
        </div>
    );
}
