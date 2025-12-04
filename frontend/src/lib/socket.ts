import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

class SocketClient {
    private socket: Socket | null = null;

    connect(token: string) {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(WS_URL, {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket() {
        return this.socket;
    }

    emit(event: string, data?: any) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    on(event: string, callback: (...args: any[]) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event: string, callback?: (...args: any[]) => void) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }
}

export const socketClient = new SocketClient();
export default socketClient;
