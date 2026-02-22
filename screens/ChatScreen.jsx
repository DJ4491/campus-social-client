import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ============================================================
//  API LAYER
// ============================================================
const BASE_URL = "https://your-api.com/api";
const getAuthToken = () => {
  try {
    if (typeof localStorage !== "undefined") return localStorage.getItem("token") || "";
  } catch (_) {}
  return "";
};

const api = {
  headers: () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  }),
  getConversations: async () => {
    await new Promise((r) => setTimeout(r, 700));
    return { conversations: MOCK_CONVERSATIONS };
  },
  getMessages: async (conversationId) => {
    await new Promise((r) => setTimeout(r, 500));
    return {
      messages: MOCK_MESSAGES[conversationId] || MOCK_MESSAGES["default"],
    };
  },
  sendMessage: async (conversationId, text) => {
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
//  MOCK DATA (unchanged)
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
  { bg: "#FF6B6B", fg: "#fff" },
  { bg: "#4ECDC4", fg: "#fff" },
  { bg: "#45B7D1", fg: "#fff" },
  { bg: "#A29BFE", fg: "#fff" },
  { bg: "#FDCB6E", fg: "#2d2d2d" },
  { bg: "#E17055", fg: "#fff" },
  { bg: "#00B894", fg: "#fff" },
  { bg: "#6C5CE7", fg: "#fff" },
];

const getAv = (name) => AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================
//  ANIMATED COMPONENTS
// ============================================================
function FadeUpView({ children, delay = 0, style }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 320,
      delay,
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const opacity = anim;
  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

function PopInView({ children, delay = 0, style }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  }, [anim, delay]);
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });
  const opacity = anim;
  return (
    <Animated.View style={[style, { opacity, transform: [{ scale }, { translateY }] }]}>
      {children}
    </Animated.View>
  );
}

function BounceDot({ delay = 0 }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const id = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    }, delay);
    return () => {
      clearTimeout(id);
      anim.stopAnimation();
    };
  }, [anim, delay]);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  return (
    <Animated.View
      style={[styles.typingDot, { transform: [{ translateY }] }]}
    />
  );
}

function Spinner() {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 700, useNativeDriver: true })
    ).start();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]} />;
}

// ============================================================
//  CHAT SCREEN (root with screen transition)
// ============================================================
export default function ChatScreen() {
  const [screen, setScreen] = useState("list");
  const [activeConv, setActiveConv] = useState(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const openChat = (conv) => {
    setActiveConv(conv);
    setScreen("room");
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const goBack = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      setScreen("list");
      setActiveConv(null);
    });
  };

  const listTranslateX = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -SCREEN_WIDTH] });
  const listOpacity = slideAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.3, 0] });
  const roomTranslateX = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_WIDTH, 0] });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.phone}>
        <View style={styles.statusBar}>
          <Text style={styles.statusTime}>9:41</Text>
          <View style={styles.statusIcons}>
            <Text style={styles.statusIconText}>●●●</Text>
            <Text style={styles.statusIconText}>WiFi</Text>
            <Text style={styles.statusIconText}>🔋</Text>
          </View>
        </View>

        <View style={styles.screenBody}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.listScreenWrap,
              { transform: [{ translateX: listTranslateX }], opacity: listOpacity },
            ]}
            pointerEvents={screen === "list" ? "auto" : "none"}
          >
            <ChatList onOpen={openChat} />
          </Animated.View>

          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.roomScreenWrap,
              { transform: [{ translateX: roomTranslateX }] },
            ]}
            pointerEvents={screen === "room" ? "auto" : "none"}
          >
            {activeConv && (
              <ChatRoom conv={activeConv} onBack={goBack} />
            )}
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
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
    if (!search.trim()) {
      setFiltered(convs);
      return;
    }
    setFiltered(
      convs.filter(
        (c) =>
          c.user.name.toLowerCase().includes(search.toLowerCase()) ||
          c.lastMessage.text.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, convs]);

  const onlineUsers = convs.filter((c) => c.user.isOnline);

  const renderConv = ({ item: c, index }) => {
    const av = getAv(c.user.name);
    const unread = c.unreadCount > 0;
    return (
      <FadeUpView key={c.id} delay={Math.min(index * 45, 320)}>
        <TouchableOpacity
          style={styles.convCard}
          onPress={() => onOpen(c)}
          activeOpacity={0.85}
        >
          <View style={styles.caWrap}>
            <View style={[styles.ca, { backgroundColor: av.bg }]}>
              <Text style={[styles.caText, { color: av.fg }]}>{getInitials(c.user.name)}</Text>
            </View>
            {c.user.isOnline && <View style={styles.caDot} />}
          </View>
          <View style={styles.cc}>
            <View style={styles.ccRow1}>
              <Text style={[styles.ccName, unread && styles.ccNameBold]} numberOfLines={1}>
                {c.user.name}
              </Text>
              <Text style={[styles.ccTime, unread && styles.ccTimeAccent]}>
                {formatTime(c.lastMessage.timestamp)}
              </Text>
            </View>
            <View style={styles.ccRow2}>
              <Text style={[styles.ccMsg, unread && styles.ccMsgBold]} numberOfLines={1}>
                {c.lastMessage.text}
              </Text>
              {unread && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{c.unreadCount > 99 ? "99+" : c.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </FadeUpView>
    );
  };

  return (
    <View style={styles.listScreen}>
      <View style={styles.listHeader}>
        <View style={styles.listToprow}>
          <Text style={styles.listTitle}>Chats</Text>
          <TouchableOpacity style={styles.composeBtn} activeOpacity={0.8}>
            <Text style={styles.composeBtnText}>✏️</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#a0aec0"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {onlineUsers.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.onlineRow}
        >
          {onlineUsers.map((c) => {
            const av = getAv(c.user.name);
            return (
              <TouchableOpacity
                key={c.id}
                style={styles.ouWrap}
                onPress={() => onOpen(c)}
                activeOpacity={0.8}
              >
                <View style={styles.ouRel}>
                  <View style={[styles.ouAvatar, { backgroundColor: av.bg }]}>
                    <Text style={[styles.ouAvatarText, { color: av.fg }]}>{getInitials(c.user.name)}</Text>
                  </View>
                  <View style={styles.ouDot} />
                </View>
                <Text style={styles.ouName} numberOfLines={1}>{c.user.name.split(" ")[0]}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {loading ? (
        <View style={styles.loadingWrap}>
          <Spinner />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySub}>
            {search ? "Try a different keyword" : "Start a new conversation"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderConv}
          ListHeaderComponent={<Text style={styles.sectionTag}>All Messages</Text>}
          contentContainerStyle={styles.convsScroll}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  const scrollRef = useRef(null);

  useEffect(() => {
    api.getMessages(convId).then(({ messages: msgs }) => {
      setMessages(msgs);
      setLoading(false);
    });
  }, [convId]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, typing]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    const tempId = `t-${Date.now()}`;
    setMessages((p) => [
      ...p,
      { id: tempId, text, senderId: "me", timestamp: new Date().toISOString(), status: "sending" },
    ]);

    try {
      const { message } = await api.sendMessage(convId, text);
      setMessages((p) => p.map((m) => (m.id === tempId ? { ...message, status: "delivered" } : m)));

      setTimeout(() => setTyping(true), 900);
      setTimeout(() => {
        setTyping(false);
        const replies = ["Got it, thanks! 😊", "Sounds great!", "That makes sense 👌", "Let me check on that", "Sure, I'll get back to you soon!"];
        setMessages((p) => [
          ...p,
          {
            id: `r-${Date.now()}`,
            text: replies[Math.floor(Math.random() * replies.length)],
            senderId: user.id,
            timestamp: new Date().toISOString(),
            status: "delivered",
          },
        ]);
      }, 2800);
    } catch {
      setMessages((p) => p.filter((m) => m.id !== tempId));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.roomScreen}>
      <View style={styles.roomHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.rhInfo}>
          <View style={[styles.rhAvatar, { backgroundColor: av.bg }]}>
            <Text style={[styles.rhAvatarText, { color: av.fg }]}>{getInitials(user.name)}</Text>
            {user.isOnline && <View style={styles.rhOnlineDot} />}
          </View>
          <View style={styles.rhText}>
            <Text style={styles.rhName} numberOfLines={1}>{user.name}</Text>
            <Text style={[styles.rhStatus, user.isOnline && styles.rhStatusOnline]}>
              {user.isOnline ? "Active now" : "Offline"}
            </Text>
          </View>
        </View>
        <View style={styles.rhActions}>
          <TouchableOpacity style={styles.rhBtn}><Text>📞</Text></TouchableOpacity>
          <TouchableOpacity style={styles.rhBtn}><Text>⋮</Text></TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.msgsArea}
          contentContainerStyle={styles.msgsContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {loading ? (
            <View style={styles.loadingWrap}>
              <Spinner />
            </View>
          ) : (
            <>
              <View style={styles.dateDiv}>
                <View style={styles.dateLine} />
                <Text style={styles.dateLbl}>Today</Text>
                <View style={styles.dateLine} />
              </View>

              {messages.map((msg, i) => {
                const isMine = msg.senderId === "me";
                const prev = messages[i - 1];
                const showAv = !isMine && (!prev || prev.senderId !== msg.senderId);
                return (
                  <PopInView key={msg.id} delay={Math.min(i * 35, 250)}>
                    <View style={[styles.msgRow, isMine && styles.msgRowMine]}>
                      {!isMine && (showAv ? (
                        <View style={[styles.mAvatar, { backgroundColor: av.bg }]}>
                          <Text style={[styles.mAvatarText, { color: av.fg }]}>{getInitials(user.name)}</Text>
                        </View>
                      ) : (
                        <View style={styles.mAvatarGhost} />
                      ))}
                      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                        <Text style={[styles.bText, isMine ? styles.bTextMine : styles.bTextTheirs]}>{msg.text}</Text>
                        <View style={styles.bMeta}>
                          <Text style={[styles.bTime, isMine ? styles.bTimeMine : styles.bTimeTheirs]}>
                            {formatChatTime(msg.timestamp)}
                          </Text>
                          {isMine && (
                            <Text style={styles.bStatus}>{msg.status === "sending" ? "⏳" : "✓✓"}</Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </PopInView>
                );
              })}

              {typing && (
                <View style={styles.typingRow}>
                  <View style={[styles.mAvatar, { backgroundColor: av.bg }]}>
                    <Text style={[styles.mAvatarText, { color: av.fg }]}>{getInitials(user.name)}</Text>
                  </View>
                  <View style={styles.typingBubble}>
                    <BounceDot delay={0} />
                    <BounceDot delay={200} />
                    <BounceDot delay={400} />
                  </View>
                </View>
              )}

              <View style={{ height: 20 }} />
            </>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}><Text>📎</Text></TouchableOpacity>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.msgInput}
              placeholder="Type a message..."
              placeholderTextColor="#a0aec0"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={2000}
              editable={!sending}
            />
            <TouchableOpacity><Text style={styles.emojiBtn}>😊</Text></TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
            activeOpacity={0.8}
          >
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ============================================================
//  STYLES
// ============================================================
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f0f2f5" },
  phone: { flex: 1, backgroundColor: "#f0f2f5" },
  statusBar: {
    height: Platform.OS === "ios" ? 54 : 44,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  statusTime: { fontSize: 15, fontWeight: "800", color: "#1a202c" },
  statusIcons: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusIconText: { fontSize: 13, color: "#1a202c" },
  screenBody: { flex: 1, overflow: "hidden" },
  listScreenWrap: { backgroundColor: "#f0f2f5" },
  roomScreenWrap: { backgroundColor: "#edf2f7" },

  listScreen: { flex: 1, backgroundColor: "#f0f2f5" },
  listHeader: { backgroundColor: "#fff", paddingHorizontal: 22, paddingTop: 16 },
  listToprow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  listTitle: { fontSize: 28, fontWeight: "800", color: "#1a202c", letterSpacing: -0.5 },
  composeBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#4299e1",
    alignItems: "center", justifyContent: "center",
    ...Platform.select({ ios: { shadowColor: "#4299e1", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 14 }, android: { elevation: 4 } }),
  },
  composeBtnText: { fontSize: 17 },
  searchBox: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#f0f2f5", borderRadius: 14,
    paddingVertical: 10, paddingHorizontal: 14, marginBottom: 14, gap: 9,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 15, color: "#1a202c", paddingVertical: 0 },
  clearBtn: { fontSize: 13, color: "#a0aec0", padding: 4 },
  onlineRow: { paddingVertical: 12, paddingLeft: 22, gap: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#edf2f7" },
  ouWrap: { alignItems: "center", minWidth: 54 },
  ouRel: { position: "relative" },
  ouAvatar: {
    width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: "#fff",
    ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 10 }, android: { elevation: 2 } }),
  },
  ouAvatarText: { fontSize: 15, fontWeight: "800" },
  ouDot: { position: "absolute", bottom: 1, right: 1, width: 13, height: 13, backgroundColor: "#48bb78", borderRadius: 7, borderWidth: 2.5, borderColor: "#fff" },
  ouName: { fontSize: 11, color: "#718096", fontWeight: "600", marginTop: 5, maxWidth: 54, textAlign: "center" },
  convsScroll: { paddingVertical: 8, paddingBottom: 24 },
  sectionTag: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 6, fontSize: 11, fontWeight: "700", color: "#a0aec0", letterSpacing: 1 },
  convCard: {
    flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 18, marginHorizontal: 10, marginBottom: 5,
    borderRadius: 20, backgroundColor: "#fff", gap: 12,
    ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 }, android: { elevation: 1 } }),
  },
  caWrap: { position: "relative" },
  ca: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center" },
  caText: { fontSize: 17, fontWeight: "800" },
  caDot: { position: "absolute", bottom: 1, right: 1, width: 14, height: 14, backgroundColor: "#48bb78", borderRadius: 7, borderWidth: 2.5, borderColor: "#fff" },
  cc: { flex: 1, minWidth: 0 },
  ccRow1: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 3 },
  ccName: { fontSize: 15.5, fontWeight: "600", color: "#1a202c", flex: 1 },
  ccNameBold: { fontWeight: "800" },
  ccTime: { fontSize: 12, color: "#a0aec0" },
  ccTimeAccent: { color: "#4299e1", fontWeight: "700" },
  ccRow2: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  ccMsg: { fontSize: 13.5, color: "#a0aec0", flex: 1 },
  ccMsgBold: { color: "#2d3748", fontWeight: "600" },
  badge: { backgroundColor: "#4299e1", minWidth: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  loadingWrap: { paddingTop: 60, alignItems: "center" },
  spinner: { width: 32, height: 32, borderWidth: 3, borderColor: "#e2e8f0", borderTopColor: "#4299e1", borderRadius: 16 },
  emptyState: { alignItems: "center", paddingVertical: 56, paddingHorizontal: 24, gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#4a5568" },
  emptySub: { fontSize: 13, color: "#a0aec0", textAlign: "center" },

  roomScreen: { flex: 1, backgroundColor: "#edf2f7" },
  roomHeader: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingVertical: 12, paddingHorizontal: 16, gap: 11,
    ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 8 }, android: { elevation: 2 } }),
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#edf2f7", alignItems: "center", justifyContent: "center" },
  backBtnText: { fontSize: 22, color: "#4299e1", fontWeight: "300" },
  rhInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minWidth: 0 },
  rhAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", position: "relative" },
  rhAvatarText: { fontSize: 15, fontWeight: "800" },
  rhOnlineDot: { position: "absolute", bottom: 0, right: 0, width: 12, height: 12, backgroundColor: "#48bb78", borderRadius: 6, borderWidth: 2, borderColor: "#fff" },
  rhText: { flex: 1, minWidth: 0 },
  rhName: { fontSize: 16, fontWeight: "800", color: "#1a202c" },
  rhStatus: { fontSize: 12, color: "#a0aec0", marginTop: 1 },
  rhStatusOnline: { color: "#48bb78", fontWeight: "600" },
  rhActions: { flexDirection: "row", gap: 6 },
  rhBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#edf2f7", alignItems: "center", justifyContent: "center" },
  keyboardWrap: { flex: 1 },
  msgsArea: { flex: 1 },
  msgsContent: { paddingHorizontal: 12, paddingTop: 14, paddingBottom: 8 },
  dateDiv: { flexDirection: "row", alignItems: "center", marginVertical: 8, gap: 10 },
  dateLine: { flex: 1, height: 1, backgroundColor: "#cbd5e0" },
  dateLbl: { fontSize: 11, fontWeight: "700", color: "#718096", letterSpacing: 0.4 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 7, marginBottom: 2 },
  msgRowMine: { flexDirection: "row-reverse" },
  mAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  mAvatarText: { fontSize: 10, fontWeight: "800" },
  mAvatarGhost: { width: 28 },
  bubble: { maxWidth: "73%", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20 },
  bubbleMine: {
    borderBottomRightRadius: 5, backgroundColor: "#4299e1",
    ...Platform.select({ ios: { shadowColor: "#4299e1", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 12 }, android: { elevation: 3 } }),
  },
  bubbleTheirs: {
    borderBottomLeftRadius: 5, backgroundColor: "#fff",
    ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }, android: { elevation: 2 } }),
  },
  bText: { fontSize: 14.5, lineHeight: 21 },
  bTextMine: { color: "#fff" },
  bTextTheirs: { color: "#1a202c" },
  bMeta: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4, justifyContent: "flex-end" },
  bTime: { fontSize: 10.5 },
  bTimeMine: { color: "rgba(255,255,255,0.65)" },
  bTimeTheirs: { color: "#a0aec0" },
  bStatus: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
  typingRow: { flexDirection: "row", alignItems: "flex-end", gap: 7, marginVertical: 4 },
  typingBubble: {
    flexDirection: "row", backgroundColor: "#fff", borderRadius: 20, borderBottomLeftRadius: 5,
    paddingVertical: 12, paddingHorizontal: 16, gap: 5,
    ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }, android: { elevation: 2 } }),
  },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#cbd5e0" },
  inputBar: {
    flexDirection: "row", alignItems: "flex-end", backgroundColor: "#fff", paddingVertical: 10, paddingHorizontal: 14, paddingBottom: Platform.OS === "ios" ? 16 : 10, gap: 9,
    borderTopWidth: 1, borderTopColor: "#edf2f7",
  },
  attachBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#edf2f7", alignItems: "center", justifyContent: "center" },
  inputWrap: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#edf2f7", borderRadius: 22, paddingVertical: 10, paddingHorizontal: 14, gap: 8, minHeight: 44 },
  msgInput: { flex: 1, fontSize: 15, color: "#1a202c", paddingVertical: 0, maxHeight: 80 },
  emojiBtn: { fontSize: 19, opacity: 0.7 },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#4299e1", alignItems: "center", justifyContent: "center",
    ...Platform.select({ ios: { shadowColor: "#4299e1", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 14 }, android: { elevation: 4 } }),
  },
  sendBtnDisabled: { opacity: 0.45 },
  sendBtnText: { color: "#fff", fontSize: 18 },
});
