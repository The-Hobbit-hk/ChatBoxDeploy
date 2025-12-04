'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { usersAPI, conversationsAPI } from '@/lib/api';

interface User {
    _id: string;
    username: string;
    email: string;
}

interface UserListModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserListModal({ isOpen, onClose }: UserListModalProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState<string | null>(null);
    const currentUser = useAuthStore((state) => state.user);
    const addConversation = useChatStore((state) => state.addConversation);
    const setCurrentConversation = useChatStore((state) => state.setCurrentConversation);

    useEffect(() => {
        if (isOpen) {
            loadUsers();
        }
    }, [isOpen]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const { data } = await usersAPI.getAll();
            // Filter out current user
            setUsers(data.users.filter((u: User) => u._id !== currentUser?._id));
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartDM = async (userId: string) => {
        setCreating(userId);
        try {
            const { data } = await conversationsAPI.getOrCreate(userId);
            addConversation(data.conversation);
            setCurrentConversation(data.conversation);
            onClose();
        } catch (error) {
            console.error('Failed to create conversation:', error);
        } finally {
            setCreating(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="glass rounded-3xl p-8 w-full max-w-2xl border-2 border-[var(--border)] shadow-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Start a Conversation</h2>
                        <p className="text-gray-400 text-sm mt-1">Select a user to send a direct message</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-[var(--surface-light)]"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">No other users found</div>
                    ) : (
                        users.map((user) => (
                            <button
                                key={user._id}
                                onClick={() => handleStartDM(user._id)}
                                disabled={creating === user._id}
                                className="w-full flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-light)]/60 hover:bg-[var(--surface-light)] border-2 border-transparent hover:border-[var(--primary)]/30 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-bold shadow-lg">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-semibold text-white">{user.username}</div>
                                    <div className="text-sm text-gray-400">{user.email}</div>
                                </div>
                                {creating === user._id ? (
                                    <div className="w-5 h-5 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-5 h-5 text-gray-500 group-hover:text-[var(--primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
