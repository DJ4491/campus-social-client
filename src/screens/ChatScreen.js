
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, ScrollView,
  KeyboardAvoidingView, Platform, SafeAreaView,
  Animated, RefreshControl, Pressable, StatusBar,
} from 'react-native';

// ================================================================
//  🔌 API — replace mock with your real calls
// ================================================================
const API = {
  getConversations: async () => {
    // const res = await fetch('https://your-api.com/conversations', {
    //   headers: { Authorization: `Bearer ${yourToken}` },
    // });
    // return res.json(); // expects { conversations: [...] }
    await new Promise(r => setTimeout(r, 600));
    return { conversations: MOCK_CONVERSATIONS };
  },

  getMessages: async (conversationId) => {
    // const res = await fetch(`https://your-api.com/conversations/${conversationId}/messages`, {
    //   headers: { Authorization: `Bearer ${yourToken}` },
    // });
    // return res.json(); // expects { messages: [...] }
    await new Promise(r => setTimeout(r, 400));
    return { messages: MOCK_MESSAGES[conversationId] ?? MOCK_MESSAGES.default };
  },

  sendMessage: async (conversationId, text) => {
    // const res = await fetch(`https://your-api.com/conversations/${conversationId}/messages`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${yourToken}` },
    //   body: JSON.stringify({ text }),
    // });
    // return res.json(); // expects { message: { id, text, senderId, timestamp, status } }
    await new Promise(r => setTimeout(r, 300));
    return { message: { id: `m-${Date.now()}`, text, senderId: 'me', timestamp: new Date().toISOString(), status: 'delivered' } };
  },
};

// ================================================================
//  MOCK DATA
// ================================================================
const MOCK_CONVERSATIONS = [
  { id: 'c1', user: { id: 'u1', name: 'Sarah Johnson',  isOnline: true  }, lastMessage: { text: 'See you tomorrow! 👋',         timestamp: new Date(Date.now() - 2 * 60000).toISOString(),         isRead: false }, unreadCount: 3 },
  { id: 'c2', user: { id: 'u2', name: 'Alex Chen',       isOnline: true  }, lastMessage: { text: 'The design looks incredible 🔥', timestamp: new Date(Date.now() - 18 * 60000).toISOString(),        isRead: true  }, unreadCount: 0 },
  { id: 'c3', user: { id: 'u3', name: 'Priya Sharma',    isOnline: false }, lastMessage: { text: 'Can you send me those files?',   timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),       isRead: false }, unreadCount: 7 },
  { id: 'c4', user: { id: 'u4', name: 'Marcus Williams', isOnline: false }, lastMessage: { text: 'Meeting at 3pm confirmed ✓',     timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),       isRead: true  }, unreadCount: 0 },
  { id: 'c5', user: { id: 'u5', name: 'Elena Rodriguez', isOnline: true  }, lastMessage: { text: 'haha yes exactly 😂',           timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),      isRead: true  }, unreadCount: 0 },
  { id: 'c6', user: { id: 'u6', name: 'James Park',      isOnline: false }, lastMessage: { text: "Let's sync up Monday morning",  timestamp: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), isRead: true  }, unreadCount: 0 },
  { id: 'c7', user: { id: 'u7', name: 'Aisha Patel',     isOnline: true  }, lastMessage: { text: 'Just shipped the feature 🚀',   timestamp: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), isRead: true  }, unreadCount: 0 },
];

const MOCK_MESSAGES = {
  c1: [
    { id: 'm1', text: 'Hey! How are you doing?',                                  senderId: 'u1', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'm2', text: "I'm great! Just wrapped up the new chat UI 🎉",            senderId: 'me', timestamp: new Date(Date.now() - 3500000).toISOString(), status: 'read' },
    { id: 'm3', text: "No way, that's the project you were talking about?",        senderId: 'u1', timestamp: new Date(Date.now() - 3400000).toISOString() },
    { id: 'm4', text: 'Yes! Clean mobile-first design, really happy with it 🙌', senderId: 'me', timestamp: new Date(Date.now() - 3300000).toISOString(), status: 'read' },
    { id: 'm5', text: "Send me a screenshot! I'd love to see it 👀",             senderId: 'u1', timestamp: new Date(Date.now() - 3200000).toISOString() },
    { id: 'm6', text: 'Will do! Deploying it now',                                senderId: 'me', timestamp: new Date(Date.now() - 10 * 60000).toISOString(), status: 'delivered' },
    { id: 'm7', text: 'See you tomorrow! 👋',                                     senderId: 'u1', timestamp: new Date(Date.now() - 2 * 60000).toISOString() },
  ],
  default: [
    { id: 'd1', text: 'Hey there! 👋',           senderId: 'other', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 'd2', text: 'Hi! Great to connect 😊', senderId: 'me',    timestamp: new Date(Date.now() - 3500000).toISOString(), status: 'read' },
    { id: 'd3', text: "How's everything going?", senderId: 'other', timestamp: new Date(Date.now() - 3400000).toISOString() },
  ],
};

// ================================================================
//  HELPERS
// ================================================================
const PALETTE = [
  { bg: '#FF6B6B', fg: '#fff' }, { bg: '#4ECDC4', fg: '#fff' },
  { bg: '#45B7D1', fg: '#fff' }, { bg: '#A29BFE', fg: '#fff' },
  { bg: '#FDCB6E', fg: '#2d2d2d' }, { bg: '#E17055', fg: '#fff' },
  { bg: '#00B894', fg: '#fff' }, { bg: '#6C5CE7', fg: '#fff' },
];
const getAv       = (name) => PALETTE[name.charCodeAt(0) % PALETTE.length];
const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso);
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  if (d === 1) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' });
};
const chatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: true });

// ================================================================
//  TYPING DOTS
// ================================================================
function TypingIndicator() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 200),
        Animated.timing(d, { toValue: -6, duration: 280, useNativeDriver: true }),
        Animated.timing(d, { toValue: 0,  duration: 280, useNativeDriver: true }),
        Animated.delay(560),
      ]))
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);
  return (
    <View style={s.typingRow}>
      <View style={s.typingBubble}>
        {dots.map((d, i) => <Animated.View key={i} style={[s.typingDot, { transform: [{ translateY: d }] }]} />)}
      </View>
    </View>
  );
}

// ================================================================
//  MAIN COMPONENT
// ================================================================
export default function ChatScreen() {
  const [activeConv, setActiveConv] = useState(null); // null = show list

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {activeConv === null
        ? <ChatList onOpen={setActiveConv} />
        : <ChatRoom conv={activeConv} onBack={() => setActiveConv(null)} />
      }
    </SafeAreaView>
  );
}

// ================================================================
//  CHAT LIST
// ================================================================
function ChatList({ onOpen }) {
  const [convs,      setConvs]      = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [search,     setSearch]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { conversations } = await API.getConversations();
      setConvs(conversations);
      setFiltered(conversations);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(convs); return; }
    const q = search.toLowerCase();
    setFiltered(convs.filter(c =>
      c.user.name.toLowerCase().includes(q) ||
      c.lastMessage.text.toLowerCase().includes(q)
    ));
  }, [search, convs]);

  const online = convs.filter(c => c.user.isOnline);

  const renderItem = ({ item }) => {
    const { bg, fg } = getAv(item.user.name);
    const unread = item.unreadCount > 0;
    return (
      <Pressable
        style={({ pressed }) => [s.card, unread && s.cardUnread, pressed && { opacity: 0.82 }]}
        onPress={() => onOpen(item)}
      >
        <View>
          <View style={[s.avatar, { backgroundColor: bg }]}>
            <Text style={[s.avatarTxt, { color: fg }]}>{getInitials(item.user.name)}</Text>
          </View>
          {item.user.isOnline && <View style={s.avatarDot} />}
        </View>
        <View style={s.cardBody}>
          <View style={s.row}>
            <Text style={[s.cName, unread && s.bold]} numberOfLines={1}>{item.user.name}</Text>
            <Text style={[s.cTime, unread && s.cTimeAccent]}>{timeAgo(item.lastMessage.timestamp)}</Text>
          </View>
          <View style={s.row}>
            <Text style={[s.cMsg, unread && s.cMsgBold]} numberOfLines={1}>{item.lastMessage.text}</Text>
            {unread && <View style={s.badge}><Text style={s.badgeTxt}>{item.unreadCount > 99 ? '99+' : item.unreadCount}</Text></View>}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.listHeader}>
        <View style={s.listHeaderTop}>
          <Text style={s.listTitle}>Chats</Text>
          <TouchableOpacity style={s.composeBtn}>
            <Text style={{ fontSize: 17 }}>✏️</Text>
          </TouchableOpacity>
        </View>
        <View style={s.searchBar}>
          <Text style={{ fontSize: 15 }}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search..."
            placeholderTextColor="#A0AEC0"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ fontSize: 13, color: '#A0AEC0', paddingHorizontal: 4 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Online strip */}
      {online.length > 0 && (
        <View style={s.onlineStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.onlineScroll}>
            {online.map(c => {
              const { bg, fg } = getAv(c.user.name);
              return (
                <TouchableOpacity key={c.id} style={s.onlineUser} onPress={() => onOpen(c)} activeOpacity={0.75}>
                  <View>
                    <View style={[s.onlineAv, { backgroundColor: bg }]}>
                      <Text style={[s.onlineAvTxt, { color: fg }]}>{getInitials(c.user.name)}</Text>
                    </View>
                    <View style={s.onlineDot} />
                  </View>
                  <Text style={s.onlineName} numberOfLines={1}>{c.user.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* List */}
      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color="#4299E1" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={filtered.length === 0 ? s.emptyList : s.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#4299E1" colors={['#4299E1']} />}
          ListHeaderComponent={filtered.length > 0 ? <Text style={s.sectionLabel}>ALL MESSAGES</Text> : null}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={{ fontSize: 48, marginBottom: 10 }}>💬</Text>
              <Text style={s.emptyTitle}>No conversations found</Text>
              <Text style={s.emptySub}>{search ? 'Try a different keyword' : 'Start a new conversation'}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// ================================================================
//  CHAT ROOM
// ================================================================
function ChatRoom({ conv, onBack }) {
  const { id: convId, user } = conv;
  const { bg: avBg, fg: avFg } = getAv(user.name);

  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [typing,   setTyping]   = useState(false);
  const listRef  = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    API.getMessages(convId).then(({ messages }) => {
      setMessages(messages);
      setLoading(false);
    });
    return () => clearTimeout(timerRef.current);
  }, [convId]);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages, typing]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    const tempId = `t-${Date.now()}`;
    setMessages(p => [...p, { id: tempId, text, senderId: 'me', timestamp: new Date().toISOString(), status: 'sending' }]);
    try {
      const { message } = await API.sendMessage(convId, text);
      setMessages(p => p.map(m => m.id === tempId ? { ...message } : m));
      timerRef.current = setTimeout(() => setTyping(true), 900);
      timerRef.current = setTimeout(() => {
        setTyping(false);
        const replies = ['Got it! 😊', 'Sounds great!', 'Makes sense 👌', 'On it!', "Sure, I'll get back to you!"];
        setMessages(p => [...p, { id: `r-${Date.now()}`, text: replies[Math.floor(Math.random() * replies.length)], senderId: user.id, timestamp: new Date().toISOString(), status: 'delivered' }]);
      }, 2800);
    } catch {
      setMessages(p => p.filter(m => m.id !== tempId));
      setInput(text);
    } finally { setSending(false); }
  };

  const renderItem = ({ item, index }) => {
    const isMine = item.senderId === 'me';
    const prev   = messages[index - 1];
    const showAv = !isMine && (!prev || prev.senderId !== item.senderId);
    return (
      <View style={[s.msgRow, isMine ? s.msgRowMine : s.msgRowTheirs]}>
        {!isMine && (
          showAv
            ? <View style={[s.miniAv, { backgroundColor: avBg }]}><Text style={[s.miniAvTxt, { color: avFg }]}>{getInitials(user.name)}</Text></View>
            : <View style={s.miniAvGhost} />
        )}
        <View style={[s.bubble, isMine ? s.bubbleMine : s.bubbleTheirs]}>
          <Text style={[s.bubbleTxt, isMine ? s.txtMine : s.txtTheirs]}>{item.text}</Text>
          <View style={s.bubbleMeta}>
            <Text style={[s.bubbleTime, isMine ? s.timeMine : s.timeTheirs]}>{chatTime(item.timestamp)}</Text>
            {isMine && <Text style={s.tick}>{item.status === 'sending' ? ' ⏳' : ' ✓✓'}</Text>}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.chatHeader}>
        <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.75}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={s.chatHeaderInfo}>
          <View>
            <View style={[s.chatAv, { backgroundColor: avBg }]}>
              <Text style={[s.chatAvTxt, { color: avFg }]}>{getInitials(user.name)}</Text>
            </View>
            {user.isOnline && <View style={s.chatAvDot} />}
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.chatName} numberOfLines={1}>{user.name}</Text>
            <Text style={[s.chatStatus, user.isOnline && s.chatStatusOnline]}>
              {user.isOnline ? 'Active now' : 'Offline'}
            </Text>
          </View>
        </View>
        <View style={s.chatActions}>
          <TouchableOpacity style={s.iconBtn}><Text style={s.iconBtnTxt}>📞</Text></TouchableOpacity>
          <TouchableOpacity style={s.iconBtn}><Text style={s.iconBtnTxt}>⋮</Text></TouchableOpacity>
        </View>
      </View>

      {/* Messages + Input */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {loading
          ? <View style={s.center}><ActivityIndicator size="large" color="#4299E1" /></View>
          : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.msgList}
              ListHeaderComponent={
                <View style={s.dateDivider}>
                  <View style={s.dateLine} /><Text style={s.dateText}>Today</Text><View style={s.dateLine} />
                </View>
              }
              ListFooterComponent={typing ? <TypingIndicator /> : <View style={{ height: 8 }} />}
            />
          )
        }
        {/* Input bar */}
        <View style={s.inputBar}>
          <TouchableOpacity style={s.iconBtn}><Text style={s.iconBtnTxt}>📎</Text></TouchableOpacity>
          <View style={s.inputWrap}>
            <TextInput
              style={s.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#A0AEC0"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity><Text style={{ fontSize: 20, opacity: 0.7 }}>😊</Text></TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || sending) && s.sendBtnOff]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
            activeOpacity={0.8}
          >
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={s.sendIcon}>➤</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ================================================================
//  STYLES
// ================================================================
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F0F2F5' },
  screen: { flex: 1, backgroundColor: '#F0F2F5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // ── List header ──────────────────────────────
  listHeader:    { backgroundColor: '#fff', paddingHorizontal: 22, paddingTop: 12, paddingBottom: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 3 },
  listHeaderTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  listTitle:     { fontSize: 28, fontWeight: '800', color: '#1A202C', letterSpacing: -0.5 },
  composeBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4299E1', alignItems: 'center', justifyContent: 'center', shadowColor: '#4299E1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  searchBar:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14, gap: 8 },
  searchInput:   { flex: 1, fontSize: 15, color: '#1A202C', padding: 0 },

  // ── Online strip ─────────────────────────────
  onlineStrip:  { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  onlineScroll: { paddingHorizontal: 22, paddingVertical: 12, gap: 18 },
  onlineUser:   { alignItems: 'center', gap: 5, minWidth: 54 },
  onlineAv:     { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 3 },
  onlineAvTxt:  { fontSize: 15, fontWeight: '800' },
  onlineDot:    { position: 'absolute', bottom: 1, right: 1, width: 13, height: 13, borderRadius: 6.5, backgroundColor: '#48BB78', borderWidth: 2.5, borderColor: '#fff' },
  onlineName:   { fontSize: 11, color: '#718096', fontWeight: '600', textAlign: 'center', maxWidth: 54 },

  // ── Conversation cards ────────────────────────
  listContent:  { paddingTop: 4, paddingBottom: 24 },
  emptyList:    { flexGrow: 1 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#A0AEC0', letterSpacing: 1, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 6 },
  card:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 6, borderRadius: 20, padding: 12, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  cardUnread:   { backgroundColor: '#F0F7FF' },
  cardBody:     { flex: 1, minWidth: 0 },
  row:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  avatar:       { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 3 },
  avatarTxt:    { fontSize: 17, fontWeight: '800' },
  avatarDot:    { position: 'absolute', bottom: 1, right: 1, width: 14, height: 14, borderRadius: 7, backgroundColor: '#48BB78', borderWidth: 2.5, borderColor: '#fff' },
  cName:        { fontSize: 15.5, fontWeight: '600', color: '#1A202C', flex: 1, marginRight: 8 },
  bold:         { fontWeight: '800' },
  cTime:        { fontSize: 12, color: '#A0AEC0' },
  cTimeAccent:  { color: '#4299E1', fontWeight: '700' },
  cMsg:         { fontSize: 13.5, color: '#A0AEC0', flex: 1 },
  cMsgBold:     { color: '#1A202C', fontWeight: '600' },
  badge:        { backgroundColor: '#4299E1', minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeTxt:     { color: '#fff', fontSize: 11, fontWeight: '800' },
  emptyWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle:   { fontSize: 17, fontWeight: '700', color: '#4A5568' },
  emptySub:     { fontSize: 13, color: '#A0AEC0', textAlign: 'center', marginTop: 4 },

  // ── Chat header ───────────────────────────────
  chatHeader:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  backBtn:          { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EDF2F7', alignItems: 'center', justifyContent: 'center' },
  backIcon:         { fontSize: 30, color: '#4299E1', lineHeight: 34, marginTop: -2 },
  chatHeaderInfo:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0 },
  chatAv:           { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  chatAvTxt:        { fontSize: 15, fontWeight: '800' },
  chatAvDot:        { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#48BB78', borderWidth: 2, borderColor: '#fff' },
  chatName:         { fontSize: 16, fontWeight: '800', color: '#1A202C' },
  chatStatus:       { fontSize: 12, color: '#A0AEC0', marginTop: 1 },
  chatStatusOnline: { color: '#48BB78', fontWeight: '600' },
  chatActions:      { flexDirection: 'row', gap: 6 },
  iconBtn:          { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EDF2F7', alignItems: 'center', justifyContent: 'center' },
  iconBtnTxt:       { fontSize: 17 },

  // ── Messages ──────────────────────────────────
  msgList:      { paddingHorizontal: 10, paddingTop: 12 },
  dateDivider:  { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  dateLine:     { flex: 1, height: 1, backgroundColor: '#CBD5E0' },
  dateText:     { fontSize: 11, fontWeight: '700', color: '#718096', letterSpacing: 0.4 },
  msgRow:       { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 3 },
  msgRowMine:   { flexDirection: 'row-reverse' },
  msgRowTheirs: { flexDirection: 'row' },
  miniAv:       { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  miniAvTxt:    { fontSize: 10, fontWeight: '800' },
  miniAvGhost:  { width: 28, marginRight: 6 },
  bubble:       { maxWidth: '73%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  bubbleMine:   { backgroundColor: '#4299E1', borderBottomRightRadius: 5, shadowColor: '#4299E1', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  bubbleTheirs: { backgroundColor: '#fff', borderBottomLeftRadius: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  bubbleTxt:    { fontSize: 14.5, lineHeight: 21 },
  txtMine:      { color: '#fff' },
  txtTheirs:    { color: '#1A202C' },
  bubbleMeta:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  bubbleTime:   { fontSize: 10.5 },
  timeMine:     { color: 'rgba(255,255,255,0.65)' },
  timeTheirs:   { color: '#A0AEC0' },
  tick:         { fontSize: 11, color: 'rgba(255,255,255,0.7)' },

  // ── Typing ────────────────────────────────────
  typingRow:    { paddingLeft: 14, marginBottom: 8 },
  typingBubble: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 20, borderBottomLeftRadius: 5, paddingHorizontal: 16, paddingVertical: 14, gap: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  typingDot:    { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#CBD5E0' },

  // ── Input bar ─────────────────────────────────
  inputBar:  { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#fff', paddingHorizontal: 12, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 12 : 14, gap: 8, borderTopWidth: 1, borderTopColor: '#EDF2F7' },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#EDF2F7', borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8, gap: 8, minHeight: 42 },
  textInput: { flex: 1, fontSize: 15, color: '#1A202C', maxHeight: 100, padding: 0, lineHeight: 21 },
  sendBtn:   { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4299E1', alignItems: 'center', justifyContent: 'center', shadowColor: '#4299E1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  sendBtnOff:{ opacity: 0.4, shadowOpacity: 0, elevation: 0 },
  sendIcon:  { fontSize: 18, color: '#fff' },
});