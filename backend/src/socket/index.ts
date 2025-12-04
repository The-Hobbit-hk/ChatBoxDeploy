import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Message from '../models/Message';
import Channel from '../models/Channel';
import { DirectMessage } from '../models/DirectMessage';
import { Conversation } from '../models/Conversation';

interface AuthSocket extends Socket {
    userId?: string;
}

// Track online users: userId -> socketId
const onlineUsers = new Map<string, string>();

// Track typing users: channelId -> Set of userIds
const typingUsers = new Map<string, Set<string>>();

export const initializeSocket = (io: Server) => {
    // Authentication middleware for Socket.io
    io.use(async (socket: AuthSocket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket: AuthSocket) => {
        const userId = socket.userId!;
        console.log(`User connected: ${userId}`);

        // Mark user as online
        onlineUsers.set(userId, socket.id);
        await User.findByIdAndUpdate(userId, { isOnline: true });

        // Broadcast online status to all clients
        io.emit('user_status', {
            userId,
            isOnline: true
        });

        // Send current online users to the connected client
        const onlineUserIds = Array.from(onlineUsers.keys());
        socket.emit('online_users', onlineUserIds);

        // Join user's channels
        const channels = await Channel.find({ members: userId });
        channels.forEach(channel => {
            socket.join(channel._id.toString());
        });

        // Handle joining a channel
        socket.on('join_channel', async (channelId: string) => {
            try {
                const channel = await Channel.findById(channelId);
                if (channel && channel.members.includes(userId as any)) {
                    socket.join(channelId);
                    console.log(`User ${userId} joined channel ${channelId}`);
                } else {
                    console.log(`User ${userId} failed to join channel ${channelId} (not a member or channel not found)`);
                }
            } catch (error) {
                console.error('Join channel error:', error);
            }
        });

        // Handle leaving a channel
        socket.on('leave_channel', (channelId: string) => {
            socket.leave(channelId);
            console.log(`User ${userId} left channel ${channelId}`);
        });

        // Handle sending a message
        socket.on('send_message', async (data: { channelId: string; content: string }) => {
            try {
                const { channelId, content } = data;

                if (!content || content.trim().length === 0) {
                    return;
                }

                // Verify user is a member
                const channel = await Channel.findById(channelId);
                if (!channel || !channel.members.includes(userId as any)) {
                    return;
                }

                // Save message to database
                const message = new Message({
                    sender: userId,
                    channel: channelId,
                    content: content.trim()
                });

                await message.save();
                await message.populate('sender', 'username email');

                // Broadcast to all users in the channel
                console.log(`Socket: Broadcasting message to channel ${channelId}`);
                io.to(channelId).emit('new_message', message);

                // Clear typing indicator for this user
                const typingSet = typingUsers.get(channelId);
                if (typingSet) {
                    typingSet.delete(userId);
                    io.to(channelId).emit('typing_update', {
                        channelId,
                        typingUsers: Array.from(typingSet)
                    });
                }
            } catch (error) {
                console.error('Send message error:', error);
            }
        });

        // Handle typing indicator
        socket.on('typing', async (data: { channelId: string; isTyping: boolean }) => {
            try {
                const { channelId, isTyping } = data;

                // Verify user is a member
                const channel = await Channel.findById(channelId);
                if (!channel || !channel.members.includes(userId as any)) {
                    return;
                }

                if (!typingUsers.has(channelId)) {
                    typingUsers.set(channelId, new Set());
                }

                const typingSet = typingUsers.get(channelId)!;

                if (isTyping) {
                    typingSet.add(userId);
                } else {
                    typingSet.delete(userId);
                }

                // Broadcast typing status to channel (excluding sender)
                socket.to(channelId).emit('typing_update', {
                    channelId,
                    typingUsers: Array.from(typingSet)
                });
            } catch (error) {
                console.error('Typing error:', error);
            }
        });

        // --- Direct Messaging Events ---

        // Handle joining a conversation
        socket.on('join_conversation', async (conversationId: string) => {
            try {
                const conversation = await Conversation.findById(conversationId);
                if (conversation && conversation.participants.some(p => p.toString() === userId)) {
                    socket.join(conversationId);
                    console.log(`User ${userId} joined conversation ${conversationId}`);
                } else {
                    console.log(`User ${userId} failed to join conversation ${conversationId}`);
                }
            } catch (error) {
                console.error('Join conversation error:', error);
            }
        });

        // Handle leaving a conversation
        socket.on('leave_conversation', (conversationId: string) => {
            socket.leave(conversationId);
            console.log(`User ${userId} left conversation ${conversationId}`);
        });

        // Handle sending a direct message
        socket.on('send_direct_message', async (data: { conversationId: string; content: string }) => {
            try {
                const { conversationId, content } = data;

                if (!content || content.trim().length === 0) {
                    return;
                }

                // Verify conversation and participation
                const conversation = await Conversation.findById(conversationId);
                if (!conversation || !conversation.participants.some(p => p.toString() === userId)) {
                    return;
                }

                // Create message
                const message = await DirectMessage.create({
                    conversation: conversationId,
                    sender: userId,
                    content: content.trim(),
                    readBy: [userId]
                });

                await message.populate('sender', 'username email');

                // Update conversation last message
                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: {
                        content: content.trim(),
                        sender: userId,
                        createdAt: new Date()
                    },
                    updatedAt: new Date()
                });

                // Broadcast to conversation room
                console.log(`Socket: Broadcasting DM to conversation ${conversationId}`);
                io.to(conversationId).emit('new_direct_message', message);

            } catch (error) {
                console.error('Send DM error:', error);
            }
        });

        // Handle DM typing
        socket.on('typing_dm', async (data: { conversationId: string; isTyping: boolean }) => {
            try {
                const { conversationId, isTyping } = data;

                // Verify participation
                const conversation = await Conversation.findById(conversationId);
                if (!conversation || !conversation.participants.some(p => p.toString() === userId)) {
                    return;
                }

                socket.to(conversationId).emit('typing_dm_update', {
                    conversationId,
                    userId,
                    isTyping
                });
            } catch (error) {
                console.error('DM typing error:', error);
            }
        });

        // Handle channel created (broadcast to all)
        socket.on('channel_created', async (channel: any) => {
            io.emit('new_channel', channel);
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${userId}`);

            onlineUsers.delete(userId);
            await User.findByIdAndUpdate(userId, {
                isOnline: false,
                lastSeen: new Date()
            });

            // Remove from all typing indicators
            typingUsers.forEach((typingSet, channelId) => {
                if (typingSet.has(userId)) {
                    typingSet.delete(userId);
                    io.to(channelId).emit('typing_update', {
                        channelId,
                        typingUsers: Array.from(typingSet)
                    });
                }
            });

            // Broadcast offline status
            io.emit('user_status', {
                userId,
                isOnline: false
            });
        });
    });
};

export { onlineUsers };
