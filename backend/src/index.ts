import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import channelRoutes from './routes/channels';
import messageRoutes from './routes/messages';
import conversationRoutes from './routes/conversations';
import directMessageRoutes from './routes/directMessages';
import { initializeSocket } from './socket';

dotenv.config();

const allowedOrigins = [
    process.env.FRONTEND_URL,                  // from Render env
    'https://chat-box-seven-jade.vercel.app',  // your Vercel app
    'http://localhost:3000'                    // local dev
].filter(Boolean) as string[];


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});


// Middleware
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl, etc.)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log('❌ Blocked by CORS:', origin);
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    })
);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/direct-messages', directMessageRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize Socket.io
initializeSocket(io);

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 WebSocket server ready`);
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await mongoose.connection.close();
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
