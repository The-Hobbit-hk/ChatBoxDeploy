import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { DirectMessage } from '../models/DirectMessage';
import { Conversation } from '../models/Conversation';

const router = express.Router();

// Get messages for a conversation
router.get('/:conversationId', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, before } = req.query;

        // Verify user is part of conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        if (!conversation.participants.some(p => p.toString() === req.userId)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Build query
        const query: any = { conversation: conversationId };
        if (before) {
            query._id = { $lt: before };
        }

        const messages = await DirectMessage.find(query)
            .populate('sender', 'username email')
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        res.json({
            messages: messages.reverse(),
            hasMore: messages.length === Number(limit)
        });
    } catch (error) {
        console.error('Get DMs error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Send a direct message
router.post('/:conversationId', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { conversationId } = req.params;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        // Verify conversation exists and user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        if (!conversation.participants.some(p => p.toString() === req.userId)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Create message
        const message = await DirectMessage.create({
            conversation: conversationId,
            sender: req.userId,
            content: content.trim(),
            readBy: [req.userId]
        });

        await message.populate('sender', 'username email');

        // Update conversation's last message
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: {
                content: content.trim(),
                sender: req.userId,
                createdAt: new Date()
            },
            updatedAt: new Date()
        });

        res.status(201).json({ message });
    } catch (error) {
        console.error('Send DM error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Mark messages as read
router.post('/:conversationId/read', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { conversationId } = req.params;

        await DirectMessage.updateMany(
            {
                conversation: conversationId,
                readBy: { $ne: req.userId }
            },
            {
                $addToSet: { readBy: req.userId }
            }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
});

export default router;
