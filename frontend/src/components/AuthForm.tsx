'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';

export default function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const { data } = await authAPI.login({
                    email: formData.email,
                    password: formData.password
                });
                setAuth(data.user, data.accessToken, data.refreshToken);
                window.location.href = '/chat';
            } else {
                const { data } = await authAPI.signup({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                });
                setAuth(data.user, data.accessToken, data.refreshToken);
                window.location.href = '/chat';
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="glass rounded-3xl p-10 w-full max-w-md animate-scaleIn relative z-10 border-2 border-[var(--glass-border)]">
                {/* Logo/Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg glow-primary">
                        <span className="text-3xl">💬</span>
                    </div>
                </div>

                <h1 className="text-4xl font-bold mb-2 text-center">
                    <span className="gradient-text">Cosmic Chat</span>
                </h1>
                <p className="text-gray-400 text-center mb-8 text-sm">
                    {isLogin ? 'Welcome back! Sign in to continue' : 'Join the conversation today'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div className="animate-fadeIn">
                            <label className="block text-sm font-semibold mb-2 text-gray-300">Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-4 py-3.5 rounded-xl bg-[var(--surface-light)] border-2 border-[var(--border)] text-white focus:border-[var(--primary)] transition-all placeholder-gray-500 font-medium"
                                placeholder="johndoe"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-300">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-xl bg-[var(--surface-light)] border-2 border-[var(--border)] text-white focus:border-[var(--primary)] transition-all placeholder-gray-500 font-medium"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-300">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-xl bg-[var(--surface-light)] border-2 border-[var(--border)] text-white focus:border-[var(--primary)] transition-all placeholder-gray-500 font-medium"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-3.5 text-red-400 text-sm font-medium animate-fadeIn flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-base relative overflow-hidden"
                    >
                        <span className="relative z-10">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Processing...
                                </span>
                            ) : (
                                isLogin ? 'Sign In' : 'Create Account'
                            )}
                        </span>
                    </button>
                </form>

                <div className="mt-8 text-center relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[var(--border)]"></div>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="bg-[var(--surface)] px-4 py-2 text-sm rounded-lg hover:text-[var(--primary)] transition-colors font-medium border border-[var(--border)] hover:border-[var(--primary)]/50"
                        >
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
