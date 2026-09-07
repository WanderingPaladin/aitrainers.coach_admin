import { io, type Socket } from 'socket.io-client';
import { getChatSocketToken, realtimeUrl } from './api';

export const TEAM_PRESENCE_CHANNEL = 'ai-trainers-team-presence';

let socket: Socket | null = null;
let connecting: Promise<Socket | null> | null = null;

function isDevChatDebug() {
  if (import.meta.env.DEV) return true;
  if (typeof window === 'undefined') return false;
  return /aitrainersdev|localhost|127\.0\.0\.1|netlify\.app$/.test(window.location.hostname);
}

function debug(...args: unknown[]) {
  if (isDevChatDebug()) {
    console.log('[Team Presence]', ...args);
  }
}

function waitForConnect(next: Socket, timeoutMs = 10000): Promise<Socket> {
  if (next.connected) return Promise.resolve(next);
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      next.off('connect', onConnect);
      reject(new Error('Realtime connection timed out'));
    }, timeoutMs);
    const onConnect = () => {
      window.clearTimeout(timer);
      resolve(next);
    };
    next.once('connect', onConnect);
  });
}

function trackTeamPresence(target: Socket) {
  target.emit('presence:join', TEAM_PRESENCE_CHANNEL);
}

export async function getAdminChatSocket(): Promise<Socket | null> {
  if (socket?.connected) {
    trackTeamPresence(socket);
    return socket;
  }
  if (connecting) {
    return connecting;
  }
  connecting = (async () => {
    try {
      debug('admin mounted');
      const { token } = await getChatSocketToken();
      if (!token) return null;
      if (!socket) {
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
        socket.on('connect_error', (error) => {
          debug('status:', 'CHANNEL_ERROR', error.message);
        });
        socket.on('connect', () => {
          debug('status: SUBSCRIBED');
          if (socket) trackTeamPresence(socket);
          debug('tracked');
        });
        socket.on('disconnect', (reason) => {
          debug('status: CLOSED', reason);
        });
      } else {
        socket.auth = { token };
        socket.connect();
      }
      const connected = await waitForConnect(socket);
      trackTeamPresence(connected);
      return connected;
    } catch (error) {
      debug('status: TIMED_OUT', error instanceof Error ? error.message : error);
      return null;
    } finally {
      connecting = null;
    }
  })();
  return connecting;
}

export function disconnectAdminChatSocket(): void {
  if (!socket) return;
  debug('untrack');
  socket.emit('presence:leave', TEAM_PRESENCE_CHANNEL);
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  connecting = null;
}
