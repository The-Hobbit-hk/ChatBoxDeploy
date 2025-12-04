'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { channelsAPI } from '@/lib/api';
import socketClient from '@/lib/socket';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import MessageInput from '@/components/MessageInput';

export default function ChatPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const accessToken = useAuthStore((state) => state.accessToken);
    const loadFromStorage = useAuthStore((state) => state.loadFromStorage);

    const setChannels = useChatStore((state) => state.setChannels);
    const addChannel = useChatStore((state) => state.addChannel);
    const addMessage = useChatStore((state) => state.addMessage);
    const addDMMessage = useChatStore((state) => state.addDMMessage);
    const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);
    const updateUserStatus = useChatStore((state) => state.updateUserStatus);
    const setTypingUsers = useChatStore((state) => state.setTypingUsers);

    useEffect(() => {
        loadFromStorage();
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/');
            return;
        }

        initializeChat();

        return () => {
            socketClient.disconnect();
        };
    }, [isAuthenticated]);

    const initializeChat = async () => {
        try {
            // Load channels
            const { data } = await channelsAPI.getAll();
            setChannels(data.channels);

            // Connect to WebSocket
            if (accessToken) {
                const socket = socketClient.connect(accessToken);

                // Listen for online users
                socket.on('online_users', (users: string[]) => {
                    setOnlineUsers(users);
                });

                // Listen for user status changes
                socket.on('user_status', (data: { userId: string; isOnline: boolean }) => {
                    updateUserStatus(data.userId, data.isOnline);
                });

                // Listen for new messages
                socket.on('new_message', (message: any) => {
                    console.log('Socket: Received new_message:', message);
                    addMessage(message);
                });

                // Listen for new channels
                socket.on('new_channel', (channel: any) => {
                    console.log('Socket: Received new_channel:', channel);
                    addChannel(channel);
                });

                // Listen for typing updates
                socket.on('typing_update', (data: { channelId: string; typingUsers: string[] }) => {
                    setTypingUsers(data.typingUsers);
                });

                // Listen for new direct messages
                socket.on('new_direct_message', (message: any) => {
                    console.log('Socket: Received new_direct_message:', message);
                    addDMMessage(message);
                });

                // Listen for DM typing updates
                socket.on('typing_dm_update', (data: { conversationId: string; userId: string; isTyping: boolean }) => {
                    // For now, we can reuse setTypingUsers if we want to show typing in DMs similarly
                    // But the store expects a list of userIds.
                    // The backend sends { conversationId, userId, isTyping }
                    // We might need to handle this differently or update store to support DM typing properly.
                    // For simplicity, let's just log it for now or implement a basic version.

                    // Actually, let's just use the same typingUsers state for now, assuming only one conversation/channel is active.
                    // But we need to manage the list.
                    // The current implementation of setTypingUsers replaces the whole list.
                    // The channel implementation sends the whole list from backend.
                    // The DM implementation sends incremental updates.

                    // Let's just log for now to avoid breaking things, as the store expects a full list.
                    console.log('Socket: Received typing_dm_update:', data);
                });
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to initialize chat:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-pulse text-4xl mb-4">💬</div>
                    <p className="text-gray-400">Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <ChatArea />
                <MessageInput />
            </div>
        </div>
    );
}
