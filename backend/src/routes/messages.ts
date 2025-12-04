import express from 'express';
import Message from '../models/Message';
import Channel from '../models/Channel';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get messages for a channel with pagination
router.get('/:channelId', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { channelId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;
        const before = req.query.before as string; // Message ID or timestamp

        // Verify user is a member of the channel
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        if (!channel.members.includes(req.userId as any)) {
            return res.status(403).json({ error: 'Not a member of this channel' });
        }

        // Build query
        let query: any = { channel: channelId };

        if (before) {
            // Pagination: get messages before this timestamp
            const beforeMessage = await Message.findById(before);
            if (beforeMessage) {
                query.createdAt = { $lt: beforeMessage.createdAt };
            }
        }

        const messages = await Message.find(query)
            .populate('sender', 'username email')
            .sort({ createdAt: -1 })
            .limit(limit);

        // Reverse to show oldest first
        messages.reverse();

        res.json({ messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Send message (also handled via Socket.io, but this is a fallback)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { channelId, content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        // Verify user is a member
        const channel = await Channel.findById(channelId);
        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        if (!channel.members.includes(req.userId as any)) {
            return res.status(403).json({ error: 'Not a member of this channel' });
        }

        const message = new Message({
            sender: req.userId,
            channel: channelId,
            content: content.trim()
        });

        await message.save();
        await message.populate('sender', 'username email');

        res.status(201).json({ message });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
