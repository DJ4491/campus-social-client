import { useState, useEffect, useRef } from "react";

// ============================================================
//  🔌 API INTEGRATION LAYER — Replace mock calls with real API
// ============================================================
const BASE_URL = "https://your-api.com/api"; // ← CHANGE THIS
const getAuthToken = () => localStorage.getItem("token") || "your-token-here";

const api = {
  headers: () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  }),

  // GET /conversations → returns { conversations: [...] }
  getConversations: async () => {
    // REAL: const res = await fetch(`${BASE_URL}/conversations`, { headers: api.headers() });
    // REAL: return res.json();
    await new Promise((r) => setTimeout(r, 700));
    return { conversations: MOCK_CONVERSATIONS };
  },

  // GET /conversations/:id/messages → returns { messages: [...] }
  getMessages: async (conversationId) => {
    // REAL: const res = await fetch(`${BASE_URL}/conversations/${conversationId}/messages`, { headers: api.headers() });
    // REAL: return res.json();
    await new Promise((r) => setTimeout(r, 500));
    return { messages: MOCK_MESSAGES[conversationId] || MOCK_MESSAGES["default"] };
  },

  // POST /conversations/:id/messages → returns { message: {...} }
  sendMessage: async (conversationId, text) => {
    // REAL: const res = await fetch(`${BASE_URL}/conversations/${conversationId}/messages`, {
    // REAL:   method: "POST", headers: api.headers(), body: JSON.stringify({ text }),
    // REAL: });
    // REAL: return res.json();
    await new Promise((r) => setTimeout(r, 350));
    return {
      message: {
        id: `m-${Date.now()}`,
        text,
        senderId: "me",
        timestamp: new Date().toISOString(),
        status: "delivered",
      },
    };
  },
};

// ============================================================
//  MOCK DATA
// ============================================================
const MOCK_CONVERSATIONS = [
  { id: "c1", user: { id: "u1", name: "Sarah Johnson", isOnline: true }, lastMessage: { text: "See you tomorrow! 👋", timestamp: new Date(Date.now() - 2 * 60000).toISOString(), isRead: false }, unreadCount: 3 },
  { id: "c2", user: { id: "u2", name: "Alex Chen", isOnline: true }, lastMessage: { text: "The design looks incredible 🔥", timestamp: new Date(Date.now() - 18 * 60000).toISOString(), isRead: true }, unreadCount: 0 },
  { id: "c3", user: { id: "u3", name: "Priya Sharma", isOnline: false }, lastMessage: { text: "Can you send me those files?", timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), isRead: false }, unreadCount: 7 },
  { id: "c4", user: { id: "u4", name: "Marcus Williams", isOnline: false }, lastMessage: { text: "Meeting at 3pm confirmed ✓", timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), isRead: true }, unreadCount: 0 },
  { id: "c5", user: { id: "u5", name: "Elena Rodriguez", isOnline: true }, lastMessage: { text: "haha yes exactly 😂", timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), isRead: true }, unreadCount: 0 },
  { id: "c6", user: { id: "u6", name: "James Park", isOnline: false }, lastMessage: { text: "Let's sync up Monday morning", timestamp: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), isRead: true }, unreadCount: 0 },
  { id: "c7", user: { id: "u7", name: "Aisha Patel", isOnline: true }, lastMessage: { text: "Just shipped the feature 🚀", timestamp: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), isRead: true }, unreadCount: 0 },
];

const MOCK_MESSAGES = {
  c1: [
    { id: "m1", text: "Hey! How are you doing?", senderId: "u1", timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: "m2", text: "I'm great! Just wrapped up the new chat UI 🎉", senderId: "me", timestamp: new Date(Date.now() - 3500000).toISOString(), status: "read" },
    { id: "m3", text: "No way, that's the project you were talking about?", senderId: "u1", timestamp: new Date(Date.now() - 3400000).toISOString() },
    { id: "m4", text: "Yes! It has a clean mobile-first design, really happy with how it turned out", senderId: "me", timestamp: new Date(Date.now() - 3300000).toISOString(), status: "read" },
    { id: "m5", text: "Send me a screenshot! I'd love to see it 👀", senderId: "u1", timestamp: new Date(Date.now() - 3200000).toISOString() },
    { id: "m6", text: "Will do! Deploying it now", senderId: "me", timestamp: new Date(Date.now() - 10 * 60000).toISOString(), status: "delivered" },
    { id: "m7", text: "See you tomorrow! 👋", senderId: "u1", timestamp: new Date(Date.now() - 2 * 60000).toISOString() },
  ],
  default: [
    { id: "d1", text: "Hey there! 👋", senderId: "other", timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: "d2", text: "Hi! Great to connect 😊", senderId: "me", timestamp: new Date(Date.now() - 3500000).toISOString(), status: "read" },
    { id: "d3", text: "How's everything going?", senderId: "other", timestamp: new Date(Date.now() - 3400000).toISOString() },
  ],
};

// ============================================================
//  HELPERS
// ============================================================
const formatTime = (iso) => {
  const date = new Date(iso);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
};

const formatChatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: true });

const getInitials = (name) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const AVATAR_PALETTE = [
  { bg: "#FF6B6B", fg: "#fff" }, { bg: "#4ECDC4", fg: "#fff" },
  { bg: "#45B7D1", fg: "#fff" }, { bg: "#A29BFE", fg: "#fff" },
  { bg: "#FDCB6E", fg: "#2d2d2d" }, { bg: "#E17055", fg: "#fff" },
  { bg: "#00B894", fg: "#fff" }, { bg: "#6C5CE7", fg: "#fff" },
];

const getAv = (name) => AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];

// ============================================================
//  ROOT APP
// ============================================================
export default function ChatScreen() {
  const [screen, setScreen] = useState("list");
  const [activeConv, setActiveConv] = useState(null);

  const openChat = (conv) => { setActiveConv(conv); setScreen("room"); };
  const goBack = () => { setScreen("list"); setActiveConv(null); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Lato:wght@300;400;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #111217;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Lato', sans-serif;
          background-image:
            radial-gradient(ellipse 70% 60% at 15% 0%, rgba(99,179,237,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 50% 50% at 85% 100%, rgba(154,230,180,0.1) 0%, transparent 55%);
        }

        ::-webkit-scrollbar { width: 0; }

        @keyframes slideRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop {
          from { opacity: 0; transform: scale(0.88) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .phone {
          width: 393px;
          height: 852px;
          border-radius: 52px;
          overflow: hidden;
          position: relative;
          background: #f0f2f5;
          box-shadow:
            0 0 0 1.5px rgba(255,255,255,0.1),
            0 50px 100px rgba(0,0,0,0.7),
            inset 0 0 0 1px rgba(255,255,255,0.07);
          display: flex;
          flex-direction: column;
        }

        /* Notch */
        .notch {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 126px;
          height: 37px;
          background: #111217;
          border-radius: 0 0 20px 20px;
          z-index: 100;
        }

        /* Status bar */
        .status-bar {
          height: 54px;
          background: #fff;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 0 30px 10px;
          position: relative;
          flex-shrink: 0;
          z-index: 10;
        }
        .status-bar.dark { background: #1c1f2e; }
        .status-time {
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: #1a202c;
        }
        .status-icons { display: flex; gap: 5px; align-items: center; font-size: 13px; color: #1a202c; }

        .screen-body {
          flex: 1;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        /* ══════════════════════════════
           CHAT LIST
        ══════════════════════════════ */
        .list-screen {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #f0f2f5;
          animation: slideLeft 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .list-header {
          background: #fff;
          padding: 16px 22px 0;
          flex-shrink: 0;
        }

        .list-toprow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .list-title {
          font-family: 'Nunito', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #1a202c;
          letter-spacing: -0.5px;
        }

        .compose-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #4299e1;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          box-shadow: 0 4px 14px rgba(66,153,225,0.4);
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .compose-btn:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(66,153,225,0.5); }

        .search-box {
          display: flex;
          align-items: center;
          background: #f0f2f5;
          border-radius: 14px;
          padding: 10px 14px;
          gap: 9px;
          margin-bottom: 14px;
          transition: background 0.2s;
        }
        .search-box:focus-within { background: #e8f0fe; }
        .search-icon-lbl { font-size: 15px; }
        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-family: 'Lato', sans-serif;
          font-size: 15px;
          color: #1a202c;
          outline: none;
        }
        .search-input::placeholder { color: #a0aec0; }
        .clear-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #a0aec0;
          font-size: 13px;
        }

        /* Online users */
        .online-row {
          display: flex;
          gap: 16px;
          padding: 12px 0 12px 22px;
          overflow-x: auto;
          background: #fff;
          border-bottom: 1px solid #edf2f7;
          flex-shrink: 0;
        }

        .ou-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          min-width: 54px;
          flex-shrink: 0;
          transition: transform 0.15s;
        }
        .ou-wrap:hover { transform: scale(1.07); }
        .ou-rel { position: relative; }
        .ou-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 800;
          border: 3px solid #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.12);
        }
        .ou-dot {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 13px;
          height: 13px;
          background: #48bb78;
          border-radius: 50%;
          border: 2.5px solid #fff;
        }
        .ou-name {
          font-size: 11px;
          color: #718096;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 54px;
          text-align: center;
        }

        /* Conversation list */
        .convs-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }

        .section-tag {
          padding: 12px 22px 6px;
          font-family: 'Nunito', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #a0aec0;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .conv-card {
          display: flex;
          align-items: center;
          padding: 12px 18px;
          gap: 12px;
          cursor: pointer;
          margin: 0 10px 5px;
          border-radius: 20px;
          background: #fff;
          transition: all 0.18s;
          animation: fadeUp 0.32s ease both;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .conv-card:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(0,0,0,0.1); }
        .conv-card:active { transform: scale(0.985); }

        .ca-wrap { position: relative; flex-shrink: 0; }
        .ca {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Nunito', sans-serif;
          font-size: 17px;
          font-weight: 800;
        }
        .ca-dot {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 14px;
          height: 14px;
          background: #48bb78;
          border-radius: 50%;
          border: 2.5px solid #fff;
        }

        .cc { flex: 1; min-width: 0; }
        .cc-row1 { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px; }
        .cc-name {
          font-family: 'Nunito', sans-serif;
          font-size: 15.5px;
          font-weight: 600;
          color: #1a202c;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cc-name.bold { font-weight: 800; }
        .cc-time { font-size: 12px; color: #a0aec0; flex-shrink: 0; }
        .cc-time.accent { color: #4299e1; font-weight: 700; }

        .cc-row2 { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .cc-msg { font-size: 13.5px; color: #a0aec0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
        .cc-msg.bold { color: #2d3748; font-weight: 600; }

        .badge {
          background: #4299e1;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 11px;
          font-weight: 800;
          min-width: 20px;
          height: 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
          flex-shrink: 0;
        }

        /* Empty */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 56px 24px;
          gap: 10px;
        }
        .empty-icon { font-size: 48px; }
        .empty-title { font-family: 'Nunito', sans-serif; font-size: 17px; font-weight: 700; color: #4a5568; }
        .empty-sub { font-size: 13px; color: #a0aec0; text-align: center; }

        /* Spinner */
        .spinner {
          width: 32px; height: 32px;
          border: 3px solid #e2e8f0;
          border-top-color: #4299e1;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin: 60px auto;
        }

        /* ══════════════════════════════
           CHAT ROOM
        ══════════════════════════════ */
        .room-screen {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #edf2f7;
          animation: slideRight 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .room-header {
          background: #fff;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 11px;
          flex-shrink: 0;
          box-shadow: 0 1px 8px rgba(0,0,0,0.07);
        }

        .back-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #edf2f7;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          color: #4299e1;
          flex-shrink: 0;
          transition: background 0.15s, transform 0.15s;
        }
        .back-btn:hover { background: #bee3f8; transform: scale(1.08); }

        .rh-info { flex: 1; display: flex; align-items: center; gap: 10px; min-width: 0; cursor: pointer; }
        .rh-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 800;
          position: relative;
          flex-shrink: 0;
        }
        .rh-online-dot {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 12px;
          height: 12px;
          background: #48bb78;
          border-radius: 50%;
          border: 2px solid #fff;
        }
        .rh-text { min-width: 0; }
        .rh-name {
          font-family: 'Nunito', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #1a202c;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rh-status { font-size: 12px; color: #a0aec0; margin-top: 1px; }
        .rh-status.online { color: #48bb78; font-weight: 600; }

        .rh-actions { display: flex; gap: 6px; }
        .rh-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #edf2f7;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          transition: background 0.15s, transform 0.15s;
        }
        .rh-btn:hover { background: #bee3f8; transform: scale(1.08); }

        /* Messages area */
        .msgs-area {
          flex: 1;
          overflow-y: auto;
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .date-div {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 8px 0 12px;
        }
        .date-line { flex: 1; height: 1px; background: #cbd5e0; }
        .date-lbl {
          font-family: 'Nunito', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #718096;
          letter-spacing: 0.4px;
        }

        .msg-row {
          display: flex;
          align-items: flex-end;
          gap: 7px;
          animation: pop 0.25s cubic-bezier(0.34, 1.3, 0.64, 1) both;
        }
        .msg-row.mine { flex-direction: row-reverse; }

        .m-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Nunito', sans-serif;
          font-size: 10px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .m-avatar-ghost { width: 28px; flex-shrink: 0; }

        .bubble {
          max-width: 73%;
          padding: 10px 14px;
          border-radius: 20px;
          word-break: break-word;
        }
        .bubble.mine {
          background: #4299e1;
          border-bottom-right-radius: 5px;
          box-shadow: 0 3px 12px rgba(66,153,225,0.35);
        }
        .bubble.theirs {
          background: #fff;
          border-bottom-left-radius: 5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .b-text { font-size: 14.5px; line-height: 1.45; }
        .b-text.mine { color: #fff; }
        .b-text.theirs { color: #1a202c; }

        .b-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
          justify-content: flex-end;
        }
        .b-time { font-size: 10.5px; }
        .b-time.mine { color: rgba(255,255,255,0.65); }
        .b-time.theirs { color: #a0aec0; }
        .b-status { font-size: 11px; color: rgba(255,255,255,0.7); }

        /* Typing */
        .typing-row {
          display: flex;
          align-items: flex-end;
          gap: 7px;
          margin: 4px 0;
        }
        .typing-bubble {
          background: #fff;
          border-radius: 20px;
          border-bottom-left-radius: 5px;
          padding: 12px 16px;
          display: flex;
          gap: 5px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .td {
          width: 7px;
          height: 7px;
          background: #cbd5e0;
          border-radius: 50%;
          animation: bounce 1.2s ease infinite;
        }
        .td:nth-child(2) { animation-delay: 0.2s; }
        .td:nth-child(3) { animation-delay: 0.4s; }

        /* Input */
        .input-bar {
          background: #fff;
          padding: 10px 14px 16px;
          border-top: 1px solid #edf2f7;
          display: flex;
          align-items: flex-end;
          gap: 9px;
          flex-shrink: 0;
        }

        .attach-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #edf2f7;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .attach-btn:hover { background: #bee3f8; }

        .input-wrap {
          flex: 1;
          background: #edf2f7;
          border-radius: 22px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
        }
        .input-wrap:focus-within { background: #e6f0fc; }

        .msg-input {
          flex: 1;
          border: none;
          background: transparent;
          font-family: 'Lato', sans-serif;
          font-size: 15px;
          color: #1a202c;
          outline: none;
          resize: none;
          max-height: 80px;
          line-height: 1.4;
        }
        .msg-input::placeholder { color: #a0aec0; }

        .emoji-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 19px;
          opacity: 0.7;
          transition: opacity 0.15s;
          flex-shrink: 0;
        }
        .emoji-btn:hover { opacity: 1; }

        .send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #4299e1;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(66,153,225,0.4);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          color: #fff;
        }
        .send-btn:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(66,153,225,0.5); }
        .send-btn:disabled { opacity: 0.45; transform: none; cursor: not-allowed; }

        /* Responsive — fill full screen on mobile */
        @media (max-width: 480px) {
          body { align-items: flex-start; background: #fff; }
          .phone {
            width: 100vw;
            height: 100dvh;
            border-radius: 0;
            box-shadow: none;
          }
          .notch { display: none; }
          .status-bar { height: 44px; }
          .screen-body { height: calc(100dvh - 44px); }
        }
      `}</style>

      <div className="phone">
        <div className="notch" />

        {/* Status Bar */}
        <div className="status-bar">
          <span className="status-time">9:41</span>
          <div className="status-icons">
            <span>●●●</span>
            <span>WiFi</span>
            <span>🔋</span>
          </div>
        </div>

        <div className="screen-body">
          {screen === "list" ? (
            <ChatList onOpen={openChat} />
          ) : (
            <ChatRoom conv={activeConv} onBack={goBack} />
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================
//  CHAT LIST
// ============================================================
function ChatList({ onOpen }) {
  const [convs, setConvs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getConversations().then(({ conversations }) => {
      setConvs(conversations);
      setFiltered(conversations);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(convs); return; }
    setFiltered(convs.filter(
      (c) =>
        c.user.name.toLowerCase().includes(search.toLowerCase()) ||
        c.lastMessage.text.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, convs]);

  const onlineUsers = convs.filter((c) => c.user.isOnline);

  return (
    <div className="list-screen">
      <div className="list-header">
        <div className="list-toprow">
          <h1 className="list-title">Chats</h1>
          <button className="compose-btn">✏️</button>
        </div>
        <div className="search-box">
          <span className="search-icon-lbl">🔍</span>
          <input
            className="search-input"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button className="clear-btn" onClick={() => setSearch("")}>✕</button>}
        </div>
      </div>

      {/* Online users */}
      {onlineUsers.length > 0 && (
        <div className="online-row">
          {onlineUsers.map((c) => {
            const av = getAv(c.user.name);
            return (
              <div key={c.id} className="ou-wrap" onClick={() => onOpen(c)}>
                <div className="ou-rel">
                  <div className="ou-avatar" style={{ background: av.bg, color: av.fg }}>
                    {getInitials(c.user.name)}
                  </div>
                  <div className="ou-dot" />
                </div>
                <span className="ou-name">{c.user.name.split(" ")[0]}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="convs-scroll">
        {loading ? (
          <div className="spinner" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">💬</span>
            <span className="empty-title">No results found</span>
            <span className="empty-sub">
              {search ? "Try a different keyword" : "Start a new conversation"}
            </span>
          </div>
        ) : (
          <>
            <div className="section-tag">All Messages</div>
            {filtered.map((c, i) => {
              const av = getAv(c.user.name);
              const unread = c.unreadCount > 0;
              return (
                <div
                  key={c.id}
                  className="conv-card"
                  style={{ animationDelay: `${i * 0.045}s` }}
                  onClick={() => onOpen(c)}
                >
                  <div className="ca-wrap">
                    <div className="ca" style={{ background: av.bg, color: av.fg }}>
                      {getInitials(c.user.name)}
                    </div>
                    {c.user.isOnline && <div className="ca-dot" />}
                  </div>
                  <div className="cc">
                    <div className="cc-row1">
                      <span className={`cc-name ${unread ? "bold" : ""}`}>{c.user.name}</span>
                      <span className={`cc-time ${unread ? "accent" : ""}`}>{formatTime(c.lastMessage.timestamp)}</span>
                    </div>
                    <div className="cc-row2">
                      <span className={`cc-msg ${unread ? "bold" : ""}`}>{c.lastMessage.text}</span>
                      {unread && <div className="badge">{c.unreadCount > 99 ? "99+" : c.unreadCount}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
//  CHAT ROOM
// ============================================================
function ChatRoom({ conv, onBack }) {
  const { id: convId, user } = conv;
  const av = getAv(user.name);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    api.getMessages(convId).then(({ messages }) => {
      setMessages(messages);
      setLoading(false);
    });
  }, [convId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    const tempId = `t-${Date.now()}`;
    setMessages((p) => [...p, { id: tempId, text, senderId: "me", timestamp: new Date().toISOString(), status: "sending" }]);

    try {
      const { message } = await api.sendMessage(convId, text);
      setMessages((p) => p.map((m) => (m.id === tempId ? { ...message, status: "delivered" } : m)));

      // Simulate reply
      setTimeout(() => setTyping(true), 900);
      setTimeout(() => {
        setTyping(false);
        const replies = [
          "Got it, thanks! 😊", "Sounds great!", "That makes sense 👌",
          "Let me check on that", "Sure, I'll get back to you soon!",
        ];
        setMessages((p) => [...p, {
          id: `r-${Date.now()}`,
          text: replies[Math.floor(Math.random() * replies.length)],
          senderId: user.id,
          timestamp: new Date().toISOString(),
          status: "delivered",
        }]);
      }, 2800);
    } catch {
      setMessages((p) => p.filter((m) => m.id !== tempId));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="room-screen">
      {/* Header */}
      <div className="room-header">
        <button className="back-btn" onClick={onBack}>‹</button>
        <div className="rh-info">
          <div className="rh-avatar" style={{ background: av.bg, color: av.fg }}>
            {getInitials(user.name)}
            {user.isOnline && <div className="rh-online-dot" />}
          </div>
          <div className="rh-text">
            <div className="rh-name">{user.name}</div>
            <div className={`rh-status ${user.isOnline ? "online" : ""}`}>
              {user.isOnline ? "Active now" : "Offline"}
            </div>
          </div>
        </div>
        <div className="rh-actions">
          <button className="rh-btn">📞</button>
          <button className="rh-btn">⋮</button>
        </div>
      </div>

      {/* Messages */}
      <div className="msgs-area">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            <div className="date-div">
              <div className="date-line" />
              <span className="date-lbl">Today</span>
              <div className="date-line" />
            </div>

            {messages.map((msg, i) => {
              const isMine = msg.senderId === "me";
              const prev = messages[i - 1];
              const showAv = !isMine && (!prev || prev.senderId !== msg.senderId);

              return (
                <div
                  key={msg.id}
                  className={`msg-row ${isMine ? "mine" : ""}`}
                  style={{ animationDelay: `${Math.min(i * 0.035, 0.25)}s`, marginBottom: 2 }}
                >
                  {!isMine && (
                    showAv
                      ? <div className="m-avatar" style={{ background: av.bg, color: av.fg }}>{getInitials(user.name)}</div>
                      : <div className="m-avatar-ghost" />
                  )}
                  <div className={`bubble ${isMine ? "mine" : "theirs"}`}>
                    <p className={`b-text ${isMine ? "mine" : "theirs"}`}>{msg.text}</p>
                    <div className="b-meta">
                      <span className={`b-time ${isMine ? "mine" : "theirs"}`}>{formatChatTime(msg.timestamp)}</span>
                      {isMine && (
                        <span className="b-status">
                          {msg.status === "sending" ? "⏳" : "✓✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="typing-row">
                <div className="m-avatar" style={{ background: av.bg, color: av.fg }}>{getInitials(user.name)}</div>
                <div className="typing-bubble">
                  <div className="td" /><div className="td" /><div className="td" />
                </div>
              </div>
            )}

            <div ref={endRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="input-bar">
        <button className="attach-btn">📎</button>
        <div className="input-wrap">
          <textarea
            className="msg-input"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
          />
          <button className="emoji-btn">😊</button>
        </div>
        <button className="send-btn" onClick={handleSend} disabled={!input.trim() || sending}>
          ➤
        </button>
      </div>
    </div>
  );
}