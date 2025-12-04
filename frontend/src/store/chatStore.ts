import { create } from 'zustand';

export interface Message {
    _id: string;
    sender: {
        _id: string;
        username: string;
        email: string;
    };
    channel: string;
    content: string;
    createdAt: string;
}

export interface Channel {
    _id: string;
    name: string;
    description: string;
    creator: {
        _id: string;
        username: string;
    };
    members: string[];
    createdAt: string;
}

export interface Conversation {
    _id: string;
    participants: Array<{
        _id: string;
        username: string;
        email: string;
    }>;
    lastMessage?: {
        content: string;
        sender: string;
        createdAt: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface DirectMessage {
    _id: string;
    conversation: string;
    sender: {
        _id: string;
        username: string;
        email: string;
    };
    content: string;
    readBy: string[];
    createdAt: string;
}

interface ChatState {
    // Channel state
    channels: Channel[];
    currentChannel: Channel | null;
    messages: Message[];

    // DM state
    conversations: Conversation[];
    currentConversation: Conversation | null;
    dmMessages: DirectMessage[];

    // View mode
    viewMode: 'channel' | 'dm';

    // Common state
    onlineUsers: string[];
    typingUsers: string[];

    // Channel methods
    setChannels: (channels: Channel[]) => void;
    addChannel: (channel: Channel) => void;
    setCurrentChannel: (channel: Channel | null) => void;
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    prependMessages: (messages: Message[]) => void;

    // DM methods
    setConversations: (conversations: Conversation[]) => void;
    addConversation: (conversation: Conversation) => void;
    setCurrentConversation: (conversation: Conversation | null) => void;
    setDMMessages: (messages: DirectMessage[]) => void;
    addDMMessage: (message: DirectMessage) => void;

    // View mode
    setViewMode: (mode: 'channel' | 'dm') => void;

    // Common methods
    setOnlineUsers: (users: string[]) => void;
    updateUserStatus: (userId: string, isOnline: boolean) => void;
    setTypingUsers: (users: string[]) => void;
    reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    // Channel state
    channels: [],
    currentChannel: null,
    messages: [],

    // DM state
    conversations: [],
    currentConversation: null,
    dmMessages: [],

    // View mode
    viewMode: 'channel',

    // Common state
    onlineUsers: [],
    typingUsers: [],

    // Channel methods
    setChannels: (channels) => set({ channels }),

    addChannel: (channel) => set((state) => ({
        channels: [channel, ...state.channels]
    })),

    setCurrentChannel: (channel) => set({
        currentChannel: channel,
        messages: [],
        viewMode: 'channel'
    }),

    setMessages: (messages) => set({ messages }),

    addMessage: (message) => set((state) => {
        if (state.messages.some(m => m._id === message._id)) {
            return state;
        }
        return {
            messages: [...state.messages, message]
        };
    }),

    prependMessages: (messages) => set((state) => ({
        messages: [...messages, ...state.messages]
    })),

    // DM methods
    setConversations: (conversations) => set({ conversations }),

    addConversation: (conversation) => set((state) => ({
        conversations: [conversation, ...state.conversations]
    })),

    setCurrentConversation: (conversation) => set({
        currentConversation: conversation,
        dmMessages: [],
        viewMode: 'dm'
    }),

    setDMMessages: (messages) => set({ dmMessages: messages }),

    addDMMessage: (message) => set((state) => {
        if (state.dmMessages.some(m => m._id === message._id)) {
            return state;
        }
        return {
            dmMessages: [...state.dmMessages, message]
        };
    }),

    // View mode
    setViewMode: (mode) => set({ viewMode: mode }),

    // Common methods
    setOnlineUsers: (users) => set({ onlineUsers: users }),

    updateUserStatus: (userId, isOnline) => set((state) => {
        if (isOnline) {
            return {
                onlineUsers: state.onlineUsers.includes(userId)
                    ? state.onlineUsers
                    : [...state.onlineUsers, userId]
            };
        } else {
            return {
                onlineUsers: state.onlineUsers.filter(id => id !== userId)
            };
        }
    }),

    setTypingUsers: (users) => set({ typingUsers: users }),

    reset: () => set({
        channels: [],
        currentChannel: null,
        messages: [],
        conversations: [],
        currentConversation: null,
        dmMessages: [],
        viewMode: 'channel',
        onlineUsers: [],
        typingUsers: []
    })
}));
