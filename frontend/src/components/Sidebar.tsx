'use client';

import { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { channelsAPI } from '@/lib/api';
import socketClient from '@/lib/socket';


import InviteModal from './InviteModal';
import ChannelBrowser from './ChannelBrowser';

export default function Sidebar() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showChannelBrowser, setShowChannelBrowser] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDesc, setNewChannelDesc] = useState('');
    const [loading, setLoading] = useState(false);

    const channels = useChatStore((state) => state.channels);
    const currentChannel = useChatStore((state) => state.currentChannel);
    const setCurrentChannel = useChatStore((state) => state.setCurrentChannel);
    const addChannel = useChatStore((state) => state.addChannel);
    const onlineUsers = useChatStore((state) => state.onlineUsers);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const reset = useChatStore((state) => state.reset);

    const handleChannelClick = (channel: any) => {
        setCurrentChannel(channel);
        socketClient.emit('join_channel', channel._id);
    };

    const handleCreateChannel = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await channelsAPI.create({
                name: newChannelName,
                description: newChannelDesc
            });

            addChannel(data.channel);
            socketClient.emit('channel_created', data.channel);
            setShowCreateModal(false);
            setNewChannelName('');
            setNewChannelDesc('');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to create channel');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        socketClient.disconnect();
        logout();
        reset();
        window.location.href = '/';
    };

    return (
        <>
            <div className="w-80 glass border-r-2 border-[var(--border)] flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b-2 border-[var(--border)] bg-[var(--surface)]/30">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg glow-primary">
                                <span className="text-xl">💬</span>
                            </div>
                            <h1 className="text-2xl font-bold gradient-text tracking-tight">Cosmic Chat</h1>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]"></div>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            {onlineUsers.length} {onlineUsers.length === 1 ? 'user' : 'users'} online
                        </p>
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="text-xs bg-gradient-to-r from-[var(--primary)]/15 to-[var(--secondary)]/15 hover:from-[var(--primary)]/25 hover:to-[var(--secondary)]/25 text-[var(--primary)] px-3 py-1.5 rounded-lg border border-[var(--primary)]/30 transition-all font-semibold shadow-sm hover:shadow-md"
                        >
                            + Invite
                        </button>
                    </div>
                </div>

                {/* Channels */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-3 px-2">
                            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Channels</h2>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setShowChannelBrowser(true)}
                                    className="text-gray-400 hover:text-[var(--primary)] transition-colors p-1 rounded-md hover:bg-[var(--surface-light)]"
                                    title="Browse channels"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="text-gray-400 hover:text-[var(--primary)] transition-colors p-1 rounded-md hover:bg-[var(--surface-light)]"
                                    title="Create channel"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            {channels.map((channel) => (
                                <button
                                    key={channel._id}
                                    onClick={() => handleChannelClick(channel)}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${currentChannel?._id === channel._id
                                        ? 'bg-gradient-to-r from-[var(--primary)]/20 to-[var(--secondary)]/10 text-white border-2 border-[var(--primary)]/30 shadow-lg'
                                        : 'text-gray-400 hover:bg-[var(--surface-light)] hover:text-gray-200 border-2 border-transparent hover:border-[var(--border-light)]'
                                        }`}
                                >
                                    <div className="flex items-center relative z-10">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all ${currentChannel?._id === channel._id
                                            ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg'
                                            : 'bg-[var(--surface-lighter)] group-hover:bg-[var(--surface-hover)] text-gray-500 group-hover:text-gray-300'
                                            }`}>
                                            <span className="text-sm font-bold">#</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold truncate text-sm">{channel.name}</div>
                                        </div>
                                        {currentChannel?._id === channel._id && (
                                            <div className="w-2 h-2 rounded-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)] animate-pulse"></div>
                                        )}
                                    </div>
                                    {currentChannel?._id === channel._id && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 to-transparent opacity-50"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* User Profile */}
                <div className="p-5 border-t-2 border-[var(--border)] bg-gradient-to-b from-[var(--surface)]/40 to-[var(--surface)]/60 backdrop-blur-md">
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="relative">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-[var(--primary)]/20">
                                    {user?.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[var(--background)] rounded-full shadow-lg"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm text-white truncate">{user?.username}</div>
                                <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                    Online
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-gray-500 hover:text-red-400 transition-all p-2.5 rounded-xl hover:bg-red-500/10 opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-500/30"
                            title="Logout"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Channel Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="glass rounded-2xl p-8 w-full max-w-md border border-[var(--border)] shadow-2xl transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Create Channel</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateChannel} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Channel Name</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">#</span>
                                    <input
                                        type="text"
                                        value={newChannelName}
                                        onChange={(e) => setNewChannelName(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] text-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all placeholder-gray-600"
                                        placeholder="general"
                                        required
                                        maxLength={50}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                                <input
                                    type="text"
                                    value={newChannelDesc}
                                    onChange={(e) => setNewChannelDesc(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--surface-light)] border border-[var(--border)] text-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all placeholder-gray-600"
                                    placeholder="What's this channel about?"
                                    maxLength={200}
                                />
                            </div>
                            <div className="flex space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-[var(--surface-light)] hover:bg-[var(--surface-lighter)] text-gray-300 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 btn-primary text-white font-semibold py-3 rounded-xl disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                                >
                                    {loading ? 'Creating...' : 'Create Channel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            <InviteModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />

            {/* Channel Browser */}
            <ChannelBrowser isOpen={showChannelBrowser} onClose={() => setShowChannelBrowser(false)} />
        </>
    );
}
