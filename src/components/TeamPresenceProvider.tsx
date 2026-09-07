import { useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { disconnectAdminChatSocket, getAdminChatSocket } from '../lib/chat-socket';

export default function TeamPresenceProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  const adminName = admin?.name;

  useEffect(() => {
    if (!adminName) {
      disconnectAdminChatSocket();
      return;
    }

    void getAdminChatSocket();
  }, [adminName]);

  return children;
}
