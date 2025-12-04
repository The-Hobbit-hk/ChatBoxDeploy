'use client';

import { useState, useEffect } from 'react';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
    const [copied, setCopied] = useState(false);
    const [inviteLink, setInviteLink] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setInviteLink(window.location.origin);
        }
    }, []);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="glass rounded-3xl p-8 w-full max-w-lg border-2 border-[var(--border)] shadow-2xl transform transition-all scale-100">
                <div className="flex justify-between items-center mb-7">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg glow-primary">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Invite Users</h2>
                            <p className="text-gray-400 text-sm mt-0.5">Share access to Cosmic Chat</p>
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

                <div className="space-y-5">
                    <div className="bg-[var(--surface-light)]/60 rounded-2xl p-5 border-2 border-[var(--border)]">
                        <p className="text-gray-300 text-sm leading-relaxed font-medium mb-4">
                            To chat with others, share this link with them.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-[var(--surface)] border-2 border-[var(--border)] rounded-xl px-4 py-3 text-gray-300 text-sm truncate font-mono shadow-inner">
                                {inviteLink}
                            </div>
                            <button
                                onClick={handleCopy}
                                className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg ${copied
                                    ? 'bg-green-500/20 text-green-400 border-2 border-green-500/60 shadow-green-500/20 scale-105'
                                    : 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0'
                                    }`}
                            >
                                {copied ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Copied!
                                    </span>
                                ) : 'Copy Link'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/15 to-cyan-500/10 border-2 border-blue-500/30 rounded-2xl p-5">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border-2 border-blue-400/40 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-blue-300 font-bold text-sm mb-2">Testing with yourself?</h4>
                                <p className="text-blue-200/90 text-sm leading-relaxed">
                                    Open this link in a new <kbd className="px-1.5 py-0.5 bg-blue-400/20 rounded text-xs border border-blue-400/40 font-semibold">Incognito Window</kbd> <span className="text-blue-300/70">(Ctrl+Shift+N)</span> to create a second user and chat with yourself.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
