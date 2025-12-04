import { create } from 'zustand';

interface User {
    id: string;
    username: string;
    email: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;

    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,

    setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true
        });
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false
        });
    },

    loadFromStorage: () => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userStr = localStorage.getItem('user');

        if (accessToken && refreshToken && userStr) {
            try {
                const user = JSON.parse(userStr);
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true
                });
            } catch (error) {
                console.error('Error loading auth from storage:', error);
            }
        }
    }
}));
