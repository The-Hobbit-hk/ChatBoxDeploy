import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
                    refreshToken
                });

                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);

                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    signup: (data: { username: string; email: string; password: string }) =>
        api.post('/auth/signup', data),

    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),

    getMe: () => api.get('/auth/me')
};

// Channels API
export const channelsAPI = {
    getAll: () => api.get('/channels'),

    getAllAvailable: () => api.get('/channels/all'),

    create: (data: { name: string; description?: string }) =>
        api.post('/channels', data),

    join: (channelId: string) => api.post(`/channels/${channelId}/join`),

    leave: (channelId: string) => api.post(`/channels/${channelId}/leave`),

    getMembers: (channelId: string) => api.get(`/channels/${channelId}/members`)
};

// Messages API
export const messagesAPI = {
    get: (channelId: string, params?: { limit?: number; before?: string }) =>
        api.get(`/messages/${channelId}`, { params }),

    send: (data: { channelId: string; content: string }) =>
        api.post('/messages', data)
};

// Conversations API
export const conversationsAPI = {
    getAll: () => api.get('/conversations'),

    getOrCreate: (userId: string) => api.post(`/conversations/with/${userId}`),

    getById: (conversationId: string) => api.get(`/conversations/${conversationId}`)
};

// Direct Messages API
export const directMessagesAPI = {
    get: (conversationId: string, params?: { limit?: number; before?: string }) =>
        api.get(`/direct-messages/${conversationId}`, { params }),

    send: (conversationId: string, content: string) =>
        api.post(`/direct-messages/${conversationId}`, { content }),

    markAsRead: (conversationId: string) =>
        api.post(`/direct-messages/${conversationId}/read`)
};

// Users API
export const usersAPI = {
    getAll: () => api.get('/auth/users')
};

export default api;
