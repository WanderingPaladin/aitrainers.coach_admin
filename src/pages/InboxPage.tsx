import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getChatConversation,
  listChatConversations,
  listChatMessages,
  markChatRead,
  patchChatConversation,
  sendChatReply,
} from '../lib/api';
import { getAdminChatSocket } from '../lib/chat-socket';
import { relativeTime } from '../lib/labels';
import { ApiError } from '../lib/http';
import type { ChatConversation, ChatMessage, ChatStatus } from '../types';
import { useToast } from '../components/Toast';

const FILTERS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'open', label: 'Open' },
  { id: 'waiting_for_team', label: 'Waiting for Team' },
  { id: 'waiting_for_user', label: 'Waiting for User' },
  { id: 'resolved', label: 'Resolved' },
];

const STATUS_LABELS: Record<ChatStatus, string> = {
  open: 'Open',
  waiting_for_team: 'Waiting for team',
  waiting_for_user: 'Waiting for user',
  resolved: 'Resolved',
  closed: 'Closed',
};

export default function InboxPage() {
  const { push } = useToast();
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<ChatConversation[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [status, setStatus] = useState(params.get('status') || 'all');
  const [q, setQ] = useState(params.get('q') || '');
  const [selectedId, setSelectedId] = useState(params.get('conversation') || '');
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [visitorTyping, setVisitorTyping] = useState(false);
  const [listError, setListError] = useState('');
  const statusRef = useRef(status);
  const qRef = useRef(q);
  const selectedIdRef = useRef(selectedId);
  const typingTimer = useRef<number | null>(null);
  statusRef.current = status;
  qRef.current = q;
  selectedIdRef.current = selectedId;

  function reloadList() {
    setListError('');
    return listChatConversations({ status: statusRef.current, q: qRef.current, page: 1 })
      .then((result) => {
        setItems(result.items);
        setTotal(result.total);
        setUnreadCount(result.unreadCount);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          setListError('Sign in again to load conversations.');
          push(err.message, 'error');
          return;
        }
        if (err instanceof ApiError && err.status === 403) {
          setListError('You do not have access to Inbox.');
          push(err.message, 'error');
          return;
        }
        setListError('Unable to load conversations.');
      });
  }

  function openConversation(id: string) {
    setSelectedId(id);
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.set('conversation', id);
      return next;
    });
    void getChatConversation(id)
      .then((result) => {
        setConversation(result.conversation);
        setMessages(result.messages);
        setHasMore(result.hasMore);
        return markChatRead(id);
      })
      .then(() => reloadList())
      .catch((err: unknown) => push(err instanceof ApiError ? err.message : 'Could not open conversation', 'error'));
  }

  useEffect(() => {
    let cancelled = false;
    void reloadList();
    const selected = params.get('conversation');
    if (selected) openConversation(selected);

    const onInbox = () => void reloadList();
    const onMessage = (payload: { conversation?: ChatConversation; message?: ChatMessage }) => {
      if (payload.conversation?.id === selectedIdRef.current && payload.message) {
        setMessages((current) =>
          current.some((item) => item.id === payload.message!.id) ? current : [...current, payload.message!],
        );
        setConversation((current) => payload.conversation ?? current);
      }
      void reloadList();
    };
    const onTypingStart = (payload: { conversationId?: string; role?: string }) => {
      if (payload.conversationId === selectedIdRef.current && payload.role !== 'team') setVisitorTyping(true);
    };
    const onTypingStop = (payload: { conversationId?: string }) => {
      if (payload.conversationId === selectedIdRef.current) setVisitorTyping(false);
    };
    const onReconnect = () => {
      void getAdminChatSocket().then((socket) => {
        const id = selectedIdRef.current;
        if (id) socket?.emit('conversation:join', id);
      });
      void reloadList();
      const id = selectedIdRef.current;
      if (id) {
        void getChatConversation(id)
          .then((result) => {
            setConversation(result.conversation);
            setMessages(result.messages);
            setHasMore(result.hasMore);
          })
          .catch(() => {});
      }
    };

    void getAdminChatSocket().then((socket) => {
      if (cancelled || !socket) return;
      socket.on('inbox:update', onInbox);
      socket.on('message:new', onMessage);
      socket.on('typing:start', onTypingStart);
      socket.on('typing:stop', onTypingStop);
      socket.on('connect', onReconnect);
    });

    return () => {
      cancelled = true;
      void getAdminChatSocket().then((socket) => {
        socket?.off('inbox:update', onInbox);
        socket?.off('message:new', onMessage);
        socket?.off('typing:start', onTypingStart);
        socket?.off('typing:stop', onTypingStop);
        socket?.off('connect', onReconnect);
      });
    };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    void getAdminChatSocket().then((socket) => socket?.emit('conversation:join', selectedId));
  }, [selectedId]);

  function emitTyping(active: boolean) {
    if (!selectedId) return;
    void getAdminChatSocket().then((socket) => {
      socket?.emit(active ? 'typing:start' : 'typing:stop', selectedId);
    });
  }

  const context = conversation?.context;

  async function send() {
    if (!selectedId || !draft.trim() || sending) return;
    setSending(true);
    emitTyping(false);
    try {
      const result = await sendChatReply(selectedId, draft.trim());
      setDraft('');
      setMessages((current) =>
        current.some((item) => item.id === result.message.id) ? current : [...current, result.message],
      );
      setConversation(result.conversation);
      void reloadList();
    } catch (err: unknown) {
      push(err instanceof ApiError ? err.message : 'Could not send reply', 'error');
    } finally {
      setSending(false);
    }
  }

  async function setConversationStatus(next: ChatStatus) {
    if (!conversation) return;
    try {
      const result = await patchChatConversation(conversation.id, next);
      setConversation(result.conversation);
      void reloadList();
    } catch (err: unknown) {
      push(err instanceof ApiError ? err.message : 'Could not update conversation', 'error');
    }
  }

  const preview = useMemo(() => items, [items]);

  return (
    <div className="page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Inbox</h1>
          <p className="page-copy">Live conversations with visitors and candidates.</p>
        </div>
        <p className="m-0 text-[13px] font-semibold text-[var(--color-muted)]">{unreadCount} unread</p>
      </div>

      <div className="inbox-filters">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={status === filter.id ? 'chip is-active' : 'chip'}
            onClick={() => {
              setStatus(filter.id);
              statusRef.current = filter.id;
              void reloadList();
            }}
          >
            {filter.label}
          </button>
        ))}
        <form
          className="inbox-search"
          onSubmit={(event) => {
            event.preventDefault();
            void reloadList();
          }}
        >
          <label className="sr-only" htmlFor="inbox-q">Search</label>
          <input id="inbox-q" className="field" value={q} placeholder="Search name, email, or ID" onChange={(event) => setQ(event.target.value)} />
        </form>
      </div>

      {listError ? (
        <div className="card mt-4 p-5">
          <p className="m-0 text-[14px] font-semibold">{listError}</p>
          <button type="button" className="btn btn-primary mt-3" onClick={() => void reloadList()}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="inbox-layout">
        <section className="card inbox-list">
          {preview.length ? (
            <ul>
              {preview.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`inbox-row${item.id === selectedId ? ' is-selected' : ''}`}
                    onClick={() => openConversation(item.id)}
                  >
                    <strong>{item.displayName}</strong>
                    <span>{item.lastMessage?.body || 'No messages yet'}</span>
                    <em>{relativeTime(item.lastMessageAt)}</em>
                    {item.unreadCount ? <b>{item.unreadCount} unread</b> : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : listError ? null : (
            <div className="p-5">
              <h2 className="m-0 text-[15px] font-bold">No conversations yet</h2>
              <p className="mt-2 mb-0 text-[13px] text-[var(--color-muted)]">New visitor chats will appear here.</p>
            </div>
          )}
          <p className="inbox-count">{total} conversations</p>
        </section>

        <section className="card inbox-thread">
          {!conversation ? (
            <p className="p-5 text-[13px] text-[var(--color-muted)]">Select a conversation to reply.</p>
          ) : (
            <>
              <div className="inbox-thread-main">
                <div className="inbox-thread-head">
                  <div>
                    <h2>{conversation.displayName}</h2>
                    <p>{STATUS_LABELS[conversation.status]}{conversation.topicLabel ? ` · ${conversation.topicLabel}` : ''}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {conversation.status === 'closed' || conversation.status === 'resolved' ? (
                      <button type="button" className="btn" onClick={() => void setConversationStatus('open')}>
                        Reopen
                      </button>
                    ) : (
                      <>
                        <button type="button" className="btn" onClick={() => void setConversationStatus('resolved')}>
                          Mark Resolved
                        </button>
                        <button type="button" className="btn" onClick={() => void setConversationStatus('closed')}>
                          Close Conversation
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {hasMore ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      const first = messages[0];
                      if (!first) return;
                      void listChatMessages(conversation.id, first.id).then((result) => {
                        setMessages((current) => [...result.messages, ...current]);
                        setHasMore(result.hasMore);
                      });
                    }}
                  >
                    Load earlier messages
                  </button>
                ) : null}
                <div className="inbox-messages">
                  {messages.map((message) => (
                    <article key={message.id} className={message.senderType === 'team' || message.senderType === 'system' ? 'is-team' : 'is-visitor'}>
                      <p className="m-0 text-[11px] font-bold text-[var(--color-muted)]">
                        {message.senderType === 'team' || message.senderType === 'system' ? 'AI Trainers Team' : conversation.displayName}
                      </p>
                      <p className="mt-1 mb-0 whitespace-pre-wrap">{message.body}</p>
                    </article>
                  ))}
                  {visitorTyping ? <p className="text-[12px] text-[var(--color-muted)]">Visitor is typing…</p> : null}
                </div>
                <form
                  className="inbox-composer"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void send();
                  }}
                >
                  <label className="sr-only" htmlFor="inbox-reply">Reply</label>
                  <textarea
                    id="inbox-reply"
                    className="textarea"
                    rows={3}
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      emitTyping(true);
                      if (typingTimer.current) window.clearTimeout(typingTimer.current);
                      typingTimer.current = window.setTimeout(() => emitTyping(false), 1200);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        void send();
                      }
                    }}
                    placeholder="Type a reply..."
                  />
                  <button type="submit" className="btn btn-primary" disabled={!draft.trim() || sending}>
                    Send
                  </button>
                </form>
              </div>
              <aside className="inbox-context">
                <h3>Candidate Context</h3>
                <p className="m-0 text-[16px] font-bold">{context?.displayName || conversation.displayName}</p>
                <p className="mt-1 mb-0 text-[13px] text-[var(--color-muted)]">
                  {[context?.profession, context?.location].filter(Boolean).join(' · ') || 'No profile details yet'}
                </p>
                <dl>
                  <div><dt>Source</dt><dd>{context?.source || '—'}</dd></div>
                  <div><dt>Current Stage</dt><dd>{context?.journeyLabel || 'Visitor'}</dd></div>
                  <div><dt>Application</dt><dd>{context?.applicationCreatedAt ? `Submitted ${relativeTime(context.applicationCreatedAt)}` : 'No application yet'}</dd></div>
                  <div><dt>Intro Call</dt><dd>{context?.introCall ? relativeTime(context.introCall.startsAt) : 'Not booked'}</dd></div>
                  <div><dt>Started from</dt><dd>{context?.startedFromPage || conversation.startedFromPage || '—'}</dd></div>
                  {context?.opportunityTitle ? <div><dt>Opportunity</dt><dd>{context.opportunityTitle}</dd></div> : null}
                </dl>
                {context?.applicationId ? (
                  <Link className="btn btn-primary mt-3" to={`/admin/applications/${context.applicationId}`}>
                    View Candidate
                  </Link>
                ) : null}
              </aside>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
