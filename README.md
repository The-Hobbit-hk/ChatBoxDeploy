# Mini Team Chat Application 💬

A full-stack real-time team chat application built with Next.js, Express, Socket.io, and MongoDB. Features include real-time messaging, channels, user authentication, online presence tracking, and typing indicators.

![Team Chat](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### Core Features
- ✅ **User Authentication** - Secure signup/login with JWT tokens
- ✅ **Real-Time Messaging** - Instant message delivery via WebSockets
- ✅ **Channels** - Create, join, and leave channels
- ✅ **Message History** - Persistent message storage with pagination
- ✅ **Online Presence** - See who's currently online
- ✅ **Auto-Reconnection** - Automatic token refresh on expiry

### Bonus Features
- 🎯 **Typing Indicators** - See when someone is typing
- ⏰ **Message Timestamps** - Relative time display (e.g., "2 minutes ago")
- 👤 **User Avatars** - Colorful avatar initials
- 👥 **Channel Members** - View who's in each channel

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Modern styling with custom design system
- **Socket.io Client** - Real-time WebSocket communication
- **Zustand** - Lightweight state management
- **Axios** - HTTP client with interceptors
- **date-fns** - Date formatting utilities

### Backend
- **Node.js + Express** - REST API server
- **TypeScript** - Type-safe backend
- **Socket.io** - WebSocket server for real-time features
- **MongoDB + Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier)
- npm or yarn package manager

### 1. Clone the Repository
\`\`\`bash
git clone <your-repo-url>
cd cosmic-magnetar
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
\`\`\`

Edit \`.env\` and add your MongoDB connection string:
\`\`\`env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/team-chat
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
PORT=5000
NODE_ENV=development
\`\`\`

\`\`\`bash
# Start development server
npm run dev
\`\`\`

Backend will run on http://localhost:5000

### 3. Frontend Setup

\`\`\`bash
cd frontend

# Install dependencies
npm install

# Create environment file (copy from env-template.txt)
\`\`\`

Create \`.env.local\`:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
\`\`\`

\`\`\`bash
# Start development server
npm run dev
\`\`\`

Frontend will run on http://localhost:3000

### 4. Open the Application

Visit http://localhost:3000 and create an account to start chatting!

## 📡 API Documentation

### Authentication Endpoints

#### POST /api/auth/signup
Create a new user account.
\`\`\`json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
\`\`\`

#### POST /api/auth/login
Login with existing credentials.
\`\`\`json
{
  "email": "john@example.com",
  "password": "password123"
}
\`\`\`

#### POST /api/auth/refresh
Refresh access token using refresh token.

#### GET /api/auth/me
Get current user information (requires auth).

### Channel Endpoints

#### GET /api/channels
Get all channels user is a member of (requires auth).

#### GET /api/channels/all
Get all available channels (requires auth).

#### POST /api/channels
Create a new channel (requires auth).
\`\`\`json
{
  "name": "general",
  "description": "General discussions"
}
\`\`\`

#### POST /api/channels/:id/join
Join a channel (requires auth).

#### POST /api/channels/:id/leave
Leave a channel (requires auth).

#### GET /api/channels/:id/members
Get channel members (requires auth).

### Message Endpoints

#### GET /api/messages/:channelId
Get messages for a channel with pagination (requires auth).
Query params: \`limit\` (default: 50), \`before\` (message ID for pagination)

#### POST /api/messages
Send a message (requires auth, also handled via WebSocket).
\`\`\`json
{
  "channelId": "channel_id_here",
  "content": "Hello, world!"
}
\`\`\`

### WebSocket Events

#### Client → Server
- \`join_channel\` - Join a channel room
- \`leave_channel\` - Leave a channel room
- \`send_message\` - Send a message
- \`typing\` - Emit typing indicator

#### Server → Client
- \`online_users\` - List of online user IDs
- \`user_status\` - User online/offline status change
- \`new_message\` - New message received
- \`new_channel\` - New channel created
- \`typing_update\` - Typing indicator update

## 🎨 Design Features

- **Dark Mode** - Modern dark theme with vibrant gradients
- **Glassmorphism** - Frosted glass effect on UI elements
- **Smooth Animations** - Fade-in and slide-in transitions
- **Responsive Design** - Works on desktop and mobile
- **Custom Scrollbars** - Styled scrollbars matching the theme
- **Gradient Text** - Eye-catching gradient headings

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- MongoDB Atlas setup
- Backend deployment on Render
- Frontend deployment on Vercel

## 🧪 Testing

### Manual Testing Checklist
- [ ] Sign up new user
- [ ] Login with credentials
- [ ] Create a channel
- [ ] Join existing channel
- [ ] Send messages
- [ ] Open in two browsers and verify real-time sync
- [ ] Check typing indicators
- [ ] Verify online status updates
- [ ] Test message pagination (scroll up)
- [ ] Logout and verify cleanup

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

Built as a full-stack internship assignment demonstrating:
- Real-time WebSocket communication
- RESTful API design
- Modern React patterns
- Database design and optimization
- Authentication and authorization
- Production deployment

---

**Made with ❤️ using Next.js, Express, and Socket.io**
