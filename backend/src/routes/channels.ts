import express from 'express';
import Channel from '../models/Channel';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all channels (user is a member of)
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const channels = await Channel.find({ members: req.userId })
            .populate('creator', 'username')
            .sort({ createdAt: -1 });

        res.json({ channels });
    } catch (error) {
        console.error('Get channels error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all available channels (for discovery)
router.get('/all', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const channels = await Channel.find()
            .populate('creator', 'username')
            .select('name description members createdAt')
            .sort({ createdAt: -1 });

        res.json({ channels });
    } catch (error) {
        console.error('Get all channels error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create channel
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { name, description } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Channel name is required' });
        }

        // Check if channel exists
        const existingChannel = await Channel.findOne({ name: name.trim() });
        if (existingChannel) {
            return res.status(400).json({ error: 'Channel name already exists' });
        }

        const channel = new Channel({
            name: name.trim(),
            description: description?.trim() || '',
            creator: req.userId
        });

        await channel.save();
        await channel.populate('creator', 'username');

        res.status(201).json({ channel });
    } catch (error) {
        console.error('Create channel error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Join channel
router.post('/:id/join', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const channel = await Channel.findById(req.params.id);

        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        if (channel.members.includes(req.userId as any)) {
            return res.status(400).json({ error: 'Already a member' });
        }

        channel.members.push(req.userId as any);
        await channel.save();
        await channel.populate('creator', 'username');

        res.json({ channel });
    } catch (error) {
        console.error('Join channel error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Leave channel
router.post('/:id/leave', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const channel = await Channel.findById(req.params.id);

        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        if (!channel.members.includes(req.userId as any)) {
            return res.status(400).json({ error: 'Not a member' });
        }

        channel.members = channel.members.filter(
            (memberId) => memberId.toString() !== req.userId
        );

        await channel.save();

        res.json({ message: 'Left channel successfully' });
    } catch (error) {
        console.error('Leave channel error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get channel members
router.get('/:id/members', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const channel = await Channel.findById(req.params.id)
            .populate('members', 'username email isOnline lastSeen');

        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        res.json({ members: channel.members });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
