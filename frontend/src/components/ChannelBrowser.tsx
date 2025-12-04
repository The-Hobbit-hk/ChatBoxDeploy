'use client';

import { useState, useEffect } from 'react';
import { channelsAPI } from '@/lib/api';
import { useChatStore, Channel } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

interface ChannelBrowserProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChannelBrowser({ isOpen, onClose }: ChannelBrowserProps) {
    const [allChannels, setAllChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(false);
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const channels = useChatStore((state) => state.channels);
    const addChannel = useChatStore((state) => state.addChannel);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        if (isOpen) {
            fetchAllChannels();
        }
    }, [isOpen]);

    const fetchAllChannels = async () => {
        setLoading(true);
        try {
            const { data } = await channelsAPI.getAllAvailable();
            setAllChannels(data.channels);
        } catch (error: any) {
            console.error('Failed to fetch channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinChannel = async (channel: Channel) => {
        setJoiningId(channel._id);
        try {
            const { data } = await channelsAPI.join(channel._id);
            addChannel(data.channel);
            await fetchAllChannels(); // Refresh the list
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to join channel');
        } finally {
            setJoiningId(null);
        }
    };

    const isUserMember = (channel: Channel) => {
        return channels.some(c => c._id === channel._id);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="glass rounded-3xl p-8 w-full max-w-3xl border-2 border-[var(--border)] shadow-2xl transform transition-all scale-100 max-h-[85vh] flex flex-col">
                <div className="flex justify-between items-center mb-7">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg glow-primary">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Browse Channels</h2>
                            <p className="text-gray-400 text-sm mt-0.5">Discover and join channels</p>
                        </div>
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

                <div className="flex-1 overflow-y-auto space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
                        </div>
                    ) : allChannels.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-[var(--border)]">
                                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                            </div>
                            <p className="text-gray-400 text-base font-medium">No channels available yet</p>
                            <p className="text-gray-500 text-sm mt-2">Create the first channel to get started!</p>
                        </div>
                    ) : (
                        allChannels.map((channel) => {
                            const isMember = isUserMember(channel);
                            const memberCount = channel.members?.length || 0;

                            return (
                                <div
                                    key={channel._id}
                                    className="bg-[var(--surface-light)]/60 rounded-2xl p-5 border-2 border-[var(--border)] hover:border-[var(--primary)]/40 transition-all hover:shadow-xl hover:shadow-indigo-500/10 group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2.5 mb-2.5">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 flex items-center justify-center mr-3.5 border-2 border-[var(--primary)]/30 group-hover:from-[var(--primary)]/30 group-hover:to-[var(--secondary)]/30 transition-all">
                                                    <span className="text-[var(--primary)] text-xl font-bold">#</span>
                                                </div>
                                                <h3 className="font-bold text-white truncate text-base">{channel.name}</h3>
                                                {isMember && (
                                                    <span className="px-2.5 py-1 text-xs rounded-full bg-green-500/20 text-green-400 border-2 border-green-500/40 font-semibold shadow-sm">
                                                        Joined
                                                    </span>
                                                )}
                                            </div>
                                            {channel.description && (
                                                <p className="text-gray-400 text-sm mb-3 line-clamp-2 leading-relaxed">
                                                    {channel.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                    <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span>Created by {channel.creator?.username}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            {!isMember && (
                                                <button
                                                    onClick={() => handleJoinChannel(channel)}
                                                    disabled={joiningId === channel._id}
                                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:from-[var(--primary)]/90 hover:to-[var(--secondary)]/90 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0"
                                                >
                                                    {joiningId === channel._id ? (
                                                        <span className="flex items-center gap-2">
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                            Joining...
                                                        </span>
                                                    ) : 'Join'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
