"use client";

import * as React from "react";
import { useAccount, useWalletClient } from "wagmi";
import { FF_XMTP } from "@/src/lib/featureFlags";

type Conversation = {
  id: string;
  peerAddress: string;
  lastMessage: string;
  timestamp: number;
};

type ChatMessage = {
  id: string;
  senderInboxId: string;
  content: string;
  sentAt: number;
};

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function XmtpChatPanel() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [collapsed, setCollapsed] = React.useState(true);
  const [xmtpClient, setXmtpClient] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [newRecipient, setNewRecipient] = React.useState("");
  const [showNewChat, setShowNewChat] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientRef = React.useRef<any>(null);

  // Hidden when FF is off
  if (!FF_XMTP) return null;

  const initXmtp = async () => {
    if (clientRef.current || !walletClient) return;
    setLoading(true);
    setError("");
    try {
      const { Client } = await import("@xmtp/browser-sdk");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = await Client.create(walletClient as any, {
        env: "production",
      });
      clientRef.current = client;
      setXmtpClient(client);
      await loadConversations(client);
    } catch (err) {
      console.error("XMTP init failed:", err);
      setError(String((err as Error)?.message || "Failed to initialize XMTP"));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadConversations = async (client: any) => {
    try {
      await client.conversations.sync();
      const convos = await client.conversations.list();
      const mapped: Conversation[] = [];

      for (const c of convos.slice(0, 20)) {
        await c.sync();
        const msgs = await c.messages({ limit: BigInt(1) });
        const last = msgs[0];
        mapped.push({
          id: c.id,
          peerAddress: c.id,
          lastMessage: last?.content ? String(last.content) : "",
          timestamp: last?.sentAtNs ? Number(BigInt(last.sentAtNs) / BigInt(1_000_000)) : Date.now(),
        });
      }

      mapped.sort((a, b) => b.timestamp - a.timestamp);
      setConversations(mapped);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const openConversation = async (convoId: string) => {
    setActiveConvo(convoId);
    if (!clientRef.current) return;

    try {
      const convos = await clientRef.current.conversations.list();
      const convo = convos.find((c: { id: string }) => c.id === convoId);
      if (!convo) return;

      await convo.sync();
      const msgs = await convo.messages({ limit: BigInt(30) });
      setMessages(
        msgs.map((m: { id: string; senderInboxId: string; content: unknown; sentAtNs: bigint }) => ({
          id: m.id,
          senderInboxId: m.senderInboxId,
          content: String(m.content || ""),
          sentAt: Number(BigInt(m.sentAtNs) / BigInt(1_000_000)),
        })),
      );

      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const handleSend = async () => {
    if (!draft.trim() || !clientRef.current || !activeConvo) return;
    setSending(true);
    try {
      const convos = await clientRef.current.conversations.list();
      const convo = convos.find((c: { id: string }) => c.id === activeConvo);
      if (convo) {
        await convo.send(draft.trim());
        setDraft("");
        await openConversation(activeConvo);
      }
    } catch (err) {
      console.error("Failed to send:", err);
    } finally {
      setSending(false);
    }
  };

  const startNewChat = async () => {
    if (!newRecipient.trim() || !clientRef.current) return;
    setSending(true);
    try {
      const convo = await clientRef.current.conversations.newDm(newRecipient.trim());
      setShowNewChat(false);
      setNewRecipient("");
      await loadConversations(clientRef.current);
      await openConversation(convo.id);
    } catch (err) {
      console.error("Failed to start chat:", err);
      setError(String((err as Error)?.message || "Failed to start conversation"));
    } finally {
      setSending(false);
    }
  };

  const handleToggle = () => {
    const nextCollapsed = !collapsed;
    setCollapsed(nextCollapsed);
    if (!nextCollapsed && !clientRef.current) {
      initXmtp();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[90] flex flex-col items-end">
      {/* Chat panel */}
      {!collapsed && (
        <div className="mb-2 flex h-[480px] w-[360px] max-w-[90vw] flex-col overflow-hidden rounded-3xl border border-[color:var(--border)] bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-3">
            <div className="flex items-center gap-2">
              {activeConvo && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveConvo(null);
                    setMessages([]);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-black/50 hover:bg-black/10"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              <div className="font-[family-name:var(--font-kanit)] text-sm">
                {activeConvo ? "Conversation" : "XMTP Messages"}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {!activeConvo && !!xmtpClient && (
                <button
                  type="button"
                  onClick={() => setShowNewChat(!showNewChat)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-black/50 hover:bg-black/10"
                  title="New conversation"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-black/50 hover:bg-black/10"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-auto">
            {!isConnected && (
              <div className="flex h-full items-center justify-center p-6 text-center text-sm text-black/40">
                Connect your wallet to use XMTP messaging
              </div>
            )}

            {isConnected && loading && (
              <div className="flex h-full items-center justify-center p-6">
                <div className="text-sm text-black/50">Initializing XMTP...</div>
              </div>
            )}

            {isConnected && error && !loading && (
              <div className="p-4">
                <div className="rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs text-red-600">
                  {error}
                </div>
                <button
                  type="button"
                  onClick={initXmtp}
                  className="mt-3 w-full rounded-2xl bg-[color:var(--z-blue)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Retry
                </button>
              </div>
            )}

            {isConnected && !!xmtpClient && !activeConvo && (
              <>
                {/* New chat input */}
                {showNewChat && (
                  <div className="border-b border-[color:var(--border)] p-3">
                    <label className="text-xs font-medium text-black/60">New conversation</label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        value={newRecipient}
                        onChange={(e) => setNewRecipient(e.target.value)}
                        placeholder="0x... wallet address"
                        className="h-9 flex-1 rounded-xl border border-[color:var(--border)] bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40"
                      />
                      <button
                        type="button"
                        onClick={startNewChat}
                        disabled={sending || !newRecipient.trim()}
                        className="h-9 rounded-xl bg-[color:var(--z-blue)] px-3 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                      >
                        Start
                      </button>
                    </div>
                  </div>
                )}

                {/* Conversation list */}
                <div className="p-3">
                  {conversations.length === 0 ? (
                    <div className="py-8 text-center text-xs text-black/40">
                      No conversations yet
                    </div>
                  ) : (
                    <div className="grid gap-1.5">
                      {conversations.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => openConversation(c.id)}
                          className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-3 text-left transition hover:bg-black/5"
                        >
                          <div className="text-xs font-medium text-black/80">
                            {shortAddress(c.peerAddress)}
                          </div>
                          {c.lastMessage && (
                            <div className="mt-1 line-clamp-1 text-xs text-black/50">
                              {c.lastMessage}
                            </div>
                          )}
                          <div className="mt-1 text-[10px] text-black/30">
                            {new Date(c.timestamp).toLocaleString()}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Active conversation messages */}
            {isConnected && !!xmtpClient && activeConvo && (
              <div className="p-3">
                <div className="grid gap-2">
                  {messages.map((m) => {
                    const isSelf = m.senderInboxId === (clientRef.current as { inboxId?: string })?.inboxId;
                    return (
                      <div
                        key={m.id}
                        className={[
                          "max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-5",
                          isSelf
                            ? "ml-auto border border-[color:var(--z-blue)]/30 bg-[color:var(--z-blue)]/10"
                            : "mr-auto border border-[color:var(--border)] bg-[color:var(--panel)]",
                        ].join(" ")}
                      >
                        <div className="whitespace-pre-wrap break-words">{m.content}</div>
                        <div className="mt-1 text-[10px] text-black/30">
                          {new Date(m.sentAt).toLocaleTimeString()}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}
          </div>

          {/* Message input (when in a conversation) */}
          {isConnected && !!xmtpClient && activeConvo && (
            <div className="border-t border-[color:var(--border)] p-3">
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message..."
                  className="h-9 flex-1 rounded-xl border border-[color:var(--border)] bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="h-9 rounded-xl bg-[color:var(--z-blue)] px-3 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                >
                  {sending ? "..." : "Send"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--z-blue)] text-white shadow-lg transition hover:brightness-110 hover:shadow-xl"
        title="XMTP Messages"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {!collapsed && (
          <span className="sr-only">Close XMTP chat</span>
        )}
      </button>
    </div>
  );
}
