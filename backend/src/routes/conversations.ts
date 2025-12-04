import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Conversation } from '../models/Conversation';
import { DirectMessage } from '../models/DirectMessage';
import { User } from '../models/User';

const router = express.Router();

// Get all conversations for the authenticated user
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.userId
        })
            .populate('participants', 'username email')
            .populate('lastMessage.sender', 'username')
            .sort({ updatedAt: -1 });

        res.json({ conversations });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Get or create a conversation with another user
router.post('/with/:userId', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const targetUserId = req.params.userId;

        // Check if user exists
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [req.userId, targetUserId], $size: 2 }
        }).populate('participants', 'username email');

        // Create new conversation if doesn't exist
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.userId, targetUserId]
            });
            await conversation.populate('participants', 'username email');
        }

        res.json({ conversation });
    } catch (error) {
        console.error('Get/create conversation error:', error);
        res.status(500).json({ error: 'Failed to get conversation' });
    }
});

// Get conversation by ID
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id)
            .populate('participants', 'username email');

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Check if user is participant
        if (!conversation.participants.some(p => p._id.toString() === req.userId)) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        res.json({ conversation });
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
});

export default router;
