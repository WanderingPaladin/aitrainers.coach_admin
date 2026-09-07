import { io, type Socket } from 'socket.io-client';
import { getChatSocketToken, realtimeUrl } from './api';

let socket: Socket | null = null;
let connecting: Promise<Socket | null> | null = null;

export async function getAdminChatSocket(): Promise<Socket | null> {
  if (socket?.connected) return socket;
  if (connecting) return connecting;
  connecting = (async () => {
    try {
      const { token } = await getChatSocketToken();
      if (!token) return null;
      if (socket) {
        socket.auth = { token };
        socket.connect();
        return socket;
      }
      socket = io(realtimeUrl(), {
        path: '/socket.io',
        transports: ['polling', 'websocket'],
        auth: { token },
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 8000,
      });
      socket.io.on('reconnect_attempt', () => {
        void getChatSocketToken()
          .then((result) => {
            if (socket) socket.auth = { token: result.token };
          })
          .catch(() => {});
      });
      return socket;
    } catch {
      return null;
    } finally {
      connecting = null;
    }
  })();
  return connecting;
}
