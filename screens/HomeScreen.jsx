// top imports - remove PostCard from react-native import
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Avatar from "../components/Avatar";
import { useAuthContext } from "../hooks/use-auth-context";

const API_URL = "https://campus-social-backend-1yfe.onrender.com/posts";
const RECOMMENDED_IDS_URL =
  "https://campus-social-backend-1yfe.onrender.com/api/posts_you_may_like/";
const LIMIT = 10;
const RECOMMENDED_FETCH_LIMIT = 50;
const formatRelativeTime = (iso) => {
  if (!iso) return "";
  const created = new Date(iso);
  const now = new Date();
  const diffMs = now - created;

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"}`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr${diffHours === 1 ? "" : "s"}`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} d${diffDays === 1 ? "" : "s"}`;
  }

  return created.toLocaleDateString();
};

const PostItem = ({
  item,
  onPressComments,
  isHighlighted,
  highlightOpacity,
}) => {
  const authorObj = useMemo(
    () =>
      item?.author && typeof item.author === "object" ? item.author : null,
    [item?.author],
  );
  const authorName = useMemo(
    () =>
      (authorObj?.display_name || authorObj?.username || "").trim?.() ||
      (typeof item?.author === "string" ? item.author : "") ||
      "Unknown",
    [authorObj, item?.author],
  );
  const avatarUri = useMemo(
    () =>
      item?.avatar ||
      authorObj?.avatar_url ||
      `https://i.pravatar.cc/150?u=${encodeURIComponent(String(item?.id ?? "0"))}`,
    [item?.avatar, authorObj?.avatar_url, item?.id],
  );

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes ?? 0);

  const likeScale = useRef(new Animated.Value(1)).current;

  const toggleLike = useCallback(() => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => prev + (nextLiked ? 1 : -1));

    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.2,
        useNativeDriver: true,
        friction: 3,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
      }),
    ]).start();
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${item.title || "Post"} - ${item.desc || ""}`.trim(),
      });
    } catch (e) {
      console.log("Share error", e);
    }
  };

  return (
    <View style={styles.postCard}>
      {isHighlighted ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.postHighlightOverlay, { opacity: highlightOpacity }]}
        />
      ) : null}
      <View style={styles.postHeader}>
        <Image source={{ uri: avatarUri }} style={styles.profilePic} />
        <View style={styles.postHeaderText}>
          <Text style={styles.name}> {authorName} </Text>
          <Text style={styles.time}>
            {" "}
            {formatRelativeTime(item.created_at)}{" "}
          </Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={18} color="#8E8E93" />
      </View>

      <Text style={styles.postTitle}> {item.title} </Text>
      <Text style={styles.postText}> {item.desc} </Text>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.postImage} />
      ) : null}

      <View style={styles.postFooterMeta}>
        <Text style={styles.likeCount}> {likeCount} likes </Text>
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.postActionItem}
          activeOpacity={0.7}
          onPress={toggleLike}
        >
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={18}
              color={liked ? "#ff3b30" : "#007AFF"}
            />
          </Animated.View>
          <Text
            style={[
              styles.postActionLabel,
              liked && { color: "#ff3b30", fontWeight: "600" },
            ]}
          >
            Like
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.postActionItem}
          activeOpacity={0.7}
          onPress={() => onPressComments?.(item)}
        >
          <Ionicons name="chatbubble-outline" size={18} color="#007AFF" />
          <Text style={styles.postActionLabel}> Comment </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.postActionItem}
          activeOpacity={0.7}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={18} color="#007AFF" />
          <Text style={styles.postActionLabel}> Share </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [postText, setPostText] = useState("");
  const [image, setImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const composerInputRef = useRef(null);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentsByPost, setCommentsByPost] = useState({});
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [recommendedError, setRecommendedError] = useState(null);
  const postsListRef = useRef(null);
  const postsRef = useRef([]);
  const offsetRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const highlightOpacity = useRef(new Animated.Value(0)).current;
  const pendingHighlightIdRef = useRef(null);
  const viewableIdsRef = useRef(new Set());
  const { session, profile: contextProfile } = useAuthContext();
  const [userProfile, setUserProfile] = useState({
    avatar: null,
    name: null,
    username: null,
  });

  const wait = useCallback((ms) => new Promise((r) => setTimeout(r, ms)), []);

  const fetchInitialPosts = async () => {
    try {
      setError(null);
      setLoading(true);
      setHasMore(true);
      hasMoreRef.current = true;

      const res = await fetch(`${API_URL}?limit=${LIMIT}&offset=0`);
      const data = (await res.json()) || [];

      const arr = Array.isArray(data) ? data : [];
      postsRef.current = arr;
      offsetRef.current = arr.length;
      setPosts(arr);
      setOffset(arr.length); // use actual returned length

      if (!arr || arr.length < LIMIT) {
        setHasMore(false);
        hasMoreRef.current = false;
      }
    } catch (err) {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return [];

    try {
      loadingMoreRef.current = true;
      setLoadingMore(true);

      const res = await fetch(
        `${API_URL}?limit=${LIMIT}&offset=${offsetRef.current}`,
      );
      const data = (await res.json()) || [];

      const arr = Array.isArray(data) ? data : [];
      if (arr.length === 0) {
        setHasMore(false);
        hasMoreRef.current = false;
        return [];
      }

      const nextPosts = [...postsRef.current, ...arr];
      postsRef.current = nextPosts;
      setPosts(nextPosts);

      offsetRef.current = offsetRef.current + arr.length;
      setOffset(offsetRef.current); // keep state in sync

      if (arr.length < LIMIT) {
        setHasMore(false);
        hasMoreRef.current = false;
      }
      return arr;
    } catch (err) {
      console.log("Error loading more posts", err);
      return [];
    } finally {
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  };

  const fetchRecommendedPosts = async () => {
    try {
      setRecommendedError(null);
      setRecommendedLoading(true);

      const res = await fetch(RECOMMENDED_IDS_URL);
      const idsRaw = await res.json();
      const ids = Array.isArray(idsRaw)
        ? idsRaw.map((n) => Number(n)).filter((n) => Number.isFinite(n))
        : [];

      if (ids.length === 0) {
        setRecommendedPosts([]);
        return;
      }

      const idSet = new Set(ids);
      const byId = new Map();

      // Seed from already loaded posts (if any)
      for (const p of Array.isArray(posts) ? posts : []) {
        const id = Number(p?.id);
        if (Number.isFinite(id) && idSet.has(id)) byId.set(id, p);
      }

      // Fetch pages from posts API and "filter" to only recommended ids.
      // Stop early once all IDs are found.
      let pageOffset = 0;
      let safety = 0;
      while (byId.size < ids.length && safety < 50) {
        const r = await fetch(
          `${API_URL}?limit=${RECOMMENDED_FETCH_LIMIT}&offset=${pageOffset}`,
        );
        const data = (await r.json()) || [];
        if (!Array.isArray(data) || data.length === 0) break;

        for (const p of data) {
          const id = Number(p?.id);
          if (Number.isFinite(id) && idSet.has(id)) byId.set(id, p);
        }

        pageOffset += data.length;
        safety += 1;
      }

      // Keep ordering from the recommendations API (IDs array)
      const resolved = ids.map((id) => byId.get(id)).filter(Boolean);
      setRecommendedPosts(resolved);
    } catch (e) {
      console.log("Error fetching recommended posts", e?.message || e);
      setRecommendedError("Failed to load recommended posts");
      setRecommendedPosts([]);
    } finally {
      setRecommendedLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialPosts();
    fetchRecommendedPosts();
    loadUserProfile();
  }, [session, contextProfile]);

  const loadUserProfile = async () => {
    try {
      if (!session?.user) return;

      const user = session.user;

      const avatarUrl =
        contextProfile?.avatar_url ||
        user.user_metadata?.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(contextProfile?.username || user.email?.split("@")[0] || "User")}`;

      const displayName =
        contextProfile?.username ||
        contextProfile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "User";

      setUserProfile({
        avatar: avatarUrl,
        name: displayName,
        username: contextProfile?.username || user.email?.split("@")[0] || "user",
      });
    } catch (error) {
      console.error("Error loading user profile:", error);
      // Fallback to default avatar
      if (session?.user) {
        const user = session.user;
        setUserProfile({
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email?.split("@")[0] || "User")}`,
          name: user.email?.split("@")[0] || "User",
          username: user.email?.split("@")[0] || "user",
        });
      }
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInitialPosts();
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed to access gallery");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!postText && !image) {
      Alert.alert("Post cannot be empty");
      return;
    }

    const formData = new FormData();
    formData.append("text", postText);

    if (image) {
      formData.append("image", {
        uri: image,
        name: "post.jpg",
        type: "image/jpeg",
      });
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        // IMPORTANT: do NOT set Content-Type for FormData here
        body: formData,
      });

      const data = await res.json();
      console.log(data);

      // optionally refresh feed or prepend new post:
      // setPosts(prev => [data, ...prev]);
      setPostText("");
      setImage(null);
      Alert.alert("Post uploaded!");
    } catch (err) {
      console.log(err);
      Alert.alert("Upload failed");
    }
  };

  const canPost = postText.trim().length > 0 || image !== null;

  const openComments = useCallback((post) => {
    setActiveCommentPost(post);
    setCommentDraft("");
  }, []);

  const closeComments = useCallback(() => {
    setActiveCommentPost(null);
    setCommentDraft("");
  }, []);

  const submitCommentToActivePost = useCallback(() => {
    if (!activeCommentPost || !commentDraft.trim()) return;

    setCommentsByPost((prev) => {
      const postId = activeCommentPost.id;
      const existing = prev[postId] || [];
      const next = [
        {
          id: Date.now().toString(),
          text: commentDraft.trim(),
        },
        ...existing,
      ];
      return { ...prev, [postId]: next };
    });

    setCommentDraft("");
  }, [activeCommentPost, commentDraft]);

  const renderPost = useCallback(
    ({ item }) => (
      <PostItem
        item={item}
        onPressComments={openComments}
        isHighlighted={String(item?.id) === String(highlightedPostId)}
        highlightOpacity={highlightOpacity}
      />
    ),
    [openComments, highlightedPostId, highlightOpacity],
  );

  const triggerHighlight = useCallback(
    (postId) => {
      const idStr = String(postId);
      setHighlightedPostId(idStr);

      highlightOpacity.stopAnimation();
      highlightOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(highlightOpacity, {
          toValue: 0.22,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(highlightOpacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();

      // Clear highlight after a short delay so it doesn't persist.
      setTimeout(() => {
        setHighlightedPostId((prev) => (prev === idStr ? null : prev));
      }, 1200);
    },
    [highlightOpacity],
  );

  const triggerHighlightRef = useRef(triggerHighlight);
  useEffect(() => {
    triggerHighlightRef.current = triggerHighlight;
  }, [triggerHighlight]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    // Track what is visible
    const nextVisible = new Set(
      (viewableItems || [])
        .map((v) => v?.item?.id)
        .filter((id) => id !== null && id !== undefined)
        .map((id) => String(id)),
    );
    viewableIdsRef.current = nextVisible;

    const pending = pendingHighlightIdRef.current;
    if (!pending) return;

    if (nextVisible.has(String(pending))) {
      pendingHighlightIdRef.current = null;
      triggerHighlightRef.current?.(pending);
    }
  }).current;

  const scrollToPostId = useCallback(
    async (postId) => {
      const idStr = String(postId);

      // If not loaded yet, load more pages until found (or no more).
      let index = postsRef.current.findIndex((p) => String(p?.id) === idStr);
      let safety = 0;
      while (index < 0 && hasMoreRef.current && safety < 25) {
        const newlyLoaded = await loadMorePosts();
        if (!newlyLoaded || newlyLoaded.length === 0) break;
        await wait(0);
        index = postsRef.current.findIndex((p) => String(p?.id) === idStr);
        safety += 1;
      }

      if (index < 0) return;

      // Highlight once the target row becomes visible (so timing matches long scrolls).
      pendingHighlightIdRef.current = idStr;
      if (viewableIdsRef.current.has(idStr)) {
        pendingHighlightIdRef.current = null;
        triggerHighlight(postId);
        return;
      }

      // Give FlatList a moment to render new rows before scrolling.
      await wait(50);
      postsListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0,
      });
    },
    [loadMorePosts, triggerHighlight, wait],
  );

  const activeComments =
    activeCommentPost && commentsByPost[activeCommentPost.id]
      ? commentsByPost[activeCommentPost.id]
      : [];

  // recommendedPosts are fetched by IDs from RECOMMENDED_IDS_URL and then
  // filtered out of the posts API pages.

  const renderRecommendedPost = useCallback(
    ({ item }) => {
      const cover = item.image;
      const title = item.title || "Recommended";
      const author =
        typeof item.author === "string"
          ? item.author
          : item.author?.display_name || item.author?.username || "Unknown";

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.recommendedCard}
          onPress={() => {
            scrollToPostId(item.id);
          }}
        >
          {cover ? (
            <Image source={{ uri: cover }} style={styles.recommendedImage} />
          ) : (
            <View style={styles.recommendedImagePlaceholder}>
              <Ionicons name="image-outline" size={22} color="#9CA3AF" />
            </View>
          )}
          <Text style={styles.recommendedTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.recommendedMeta} numberOfLines={1}>
            {author} • {(item.likes ?? 0).toString()} likes
          </Text>
        </TouchableOpacity>
      );
    },
    [scrollToPostId],
  );

  const renderPostsHeader = useCallback(() => {
    if (
      !recommendedLoading &&
      !recommendedError &&
      recommendedPosts.length === 0
    ) {
      return null;
    }

    return (
      <View style={styles.recommendedSection}>
        <View style={styles.recommendedHeader}>
          <Text style={styles.recommendedHeaderTitle}> Recommended </Text>
          {recommendedLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.recommendedHeaderLink}> For you </Text>
          )}
        </View>
        {recommendedError ? (
          <Text style={styles.recommendedErrorText}> {recommendedError} </Text>
        ) : null}
        <FlatList
          data={recommendedPosts}
          keyExtractor={(item) => `rec-${String(item.id)}`}
          renderItem={renderRecommendedPost}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendedListContent}
        />
      </View>
    );
  }, [
    recommendedError,
    recommendedLoading,
    recommendedPosts,
    renderRecommendedPost,
  ]);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#8E8E93" />
          <TextInput
            placeholder="Search posts..."
            placeholderTextColor="#8E8E93"
            style={styles.searchInput}
          />
        </View>
        <View style={styles.headerIcons}>
          <Ionicons name="notifications-outline" size={24} color="#007AFF" />
          <View style={{ marginLeft: 8 }}>
            <Avatar
              uri={userProfile.avatar || "https://i.pravatar.cc/150?img=1"}
              size={32}
            />
          </View>
        </View>
      </View>

      {/* APP TITLE */}
      <View style={styles.titleRow}>
        <View style={styles.logoCircle}>
          <Ionicons name="school-outline" size={20} color="#fff" />
        </View>
        <Text style={styles.title}> Campus Social </Text>
      </View>

      {/* WHAT'S ON YOUR MIND */}
      <View style={styles.composerCard}>
        {/* TOP ROW */}
        <View style={styles.postInputContainer}>
          <View style={{ marginRight: 10 }}>
            <Avatar
              uri={userProfile.avatar || "https://i.pravatar.cc/150?img=1"}
              size={38}
            />
          </View>

          <TextInput
            placeholder="What's on your mind?"
            value={postText}
            onChangeText={setPostText}
            style={styles.postInput}
            multiline
            ref={composerInputRef}
          />

          <TouchableOpacity onPress={pickImage}>
            <Ionicons name="image-outline" size={22} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* IMAGE PREVIEW UNDER INPUT */}
        {image && (
          <View style={styles.previewWrapper}>
            <Image
              source={{ uri: image }}
              style={styles.previewImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => setImage(null)}
            >
              <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {canPost && (
          <TouchableOpacity
            style={[styles.postBtn, { opacity: canPost ? 1 : 0.4 }]}
            onPress={handlePost}
            disabled={!canPost}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}> Post </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* UPCOMING EVENTS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}> Upcoming Events </Text>
        <Text style={styles.sectionLink}> All </Text>
      </View>

      <View style={styles.eventsRow}>
        {[
          {
            label: "Tech Talk",
            date: "May 12",
            icon: "laptop-outline",
            color: "#34C759",
          },
          {
            label: "Sports Meet",
            date: "May 18",
            icon: "american-football-outline",
            color: "#FF9500",
          },
          {
            label: "Job Fair",
            date: "May 21",
            icon: "briefcase-outline",
            color: "#5856D6",
          },
          {
            label: "Hackathon",
            date: "May 25",
            icon: "code-slash-outline",
            color: "#FF2D55",
          },
        ].map((event, i, arr) => (
          <View
            key={i}
            style={[
              styles.eventCard,
              i === arr.length - 1 && { marginRight: 0 },
            ]}
          >
            <View
              style={[
                styles.eventIconWrapper,
                { backgroundColor: event.color },
              ]}
            >
              <Ionicons name={event.icon} size={16} color="#fff" />
            </View>
            <Text style={styles.eventLabel}> {event.label} </Text>
            <Text style={styles.eventDate}> {event.date} </Text>
          </View>
        ))}
      </View>

      {/* FEED FILTER TABS */}
      <View style={styles.tabsRow}>
        <View style={[styles.tabPill, styles.tabPillActive]}>
          <Text style={[styles.tabText, styles.tabTextActive]}> All </Text>
        </View>
        <View style={styles.tabPill}>
          <Text style={styles.tabText}> Announcements </Text>
        </View>
        <View style={styles.tabPill}>
          <Text style={styles.tabText}> Campus News </Text>
        </View>
        <View style={styles.tabPill}>
          <Text style={styles.tabText}> Lost & amp; Found </Text>
        </View>
      </View>

      {/* POSTS FEED */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <>
          {error ? <Text style={styles.errorText}> {error} </Text> : null}

          <FlatList
            ref={postsListRef}
            data={posts}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={7}
            removeClippedSubviews={true}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderPost}
            ListHeaderComponent={renderPostsHeader}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            onScrollToIndexFailed={(info) => {
              // Fallback for variable-height rows (mobile)
              postsListRef.current?.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: true,
              });
              setTimeout(() => {
                postsListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                  viewPosition: 0,
                });
              }, 250);
            }}
            onEndReached={loadMorePosts}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListFooterComponent={
              loadingMore ? <ActivityIndicator size="small" /> : null
            }
            ListEmptyComponent={
              !loading ? (
                <Text style={styles.emptyText}> No posts yet </Text>
              ) : null
            }
          />
        </>
      )}

      {/* COMMENTS BOTTOM SHEET (MOBILE-STYLE) */}
      <Modal
        visible={!!activeCommentPost}
        transparent
        animationType="slide"
        onRequestClose={closeComments}
      >
        <View style={styles.commentsOverlay}>
          <TouchableOpacity
            style={styles.commentsBackdrop}
            activeOpacity={1}
            onPress={closeComments}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.commentsSheet}
          >
            <View style={styles.commentsHeader}>
              <View style={styles.commentsHeaderLeft}>
                <TouchableOpacity
                  onPress={closeComments}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="chevron-down" size={22} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.commentsTitle}> Comments </Text>
              </View>
              <Text style={styles.commentsCountText}>
                {activeComments.length}{" "}
                {activeComments.length === 1 ? "comment" : "comments"}
              </Text>
            </View>

            {activeCommentPost && (
              <View style={styles.commentsPostPreview}>
                <Text style={styles.commentsPostAuthor}>
                  {typeof activeCommentPost.author === "string"
                    ? activeCommentPost.author
                    : activeCommentPost.author?.display_name ||
                      activeCommentPost.author?.username ||
                      "Unknown"}
                </Text>
                <Text style={styles.commentsPostTitle}>
                  {activeCommentPost.title}
                </Text>
                <Text style={styles.commentsPostText} numberOfLines={2}>
                  {activeCommentPost.desc}
                </Text>
              </View>
            )}

            <FlatList
              data={activeComments}
              keyExtractor={(c) => c.id}
              style={styles.commentsList}
              contentContainerStyle={
                activeComments.length === 0 && styles.commentsEmptyContainer
              }
              renderItem={({ item }) => (
                <View style={styles.commentRow}>
                  <View style={styles.commentAvatarPlaceholder}>
                    <Ionicons name="person-circle" size={28} color="#9CA3AF" />
                  </View>
                  <View style={styles.commentBubbleContainer}>
                    <Text style={styles.commentText}> {item.text} </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.commentsEmptyText}>
                  No comments yet.Start the conversation.
                </Text>
              }
            />

            <View style={styles.commentsInputBar}>
              <TextInput
                value={commentDraft}
                onChangeText={setCommentDraft}
                placeholder="Add a comment..."
                placeholderTextColor="#9CA3AF"
                style={styles.commentsInput}
              />
              <TouchableOpacity
                style={[
                  styles.commentsSendButton,
                  !commentDraft.trim() && styles.commentsSendButtonDisabled,
                ]}
                onPress={submitCommentToActivePost}
                disabled={!commentDraft.trim()}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ADD POST FLOATING ACTION BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => composerInputRef.current?.focus()}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f4f7",
    paddingHorizontal: 14,
    paddingTop: 10,
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 14,
    color: "#111827",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  profilePicSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 8,
  },

  // TITLE
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logoCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  // COMPOSER
  composerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  postInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputProfile: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  // Note: Using Avatar component instead of Image for inputProfile
  postInput: {
    flex: 1,
    fontSize: 14,
    maxHeight: 80,
  },
  previewWrapper: {
    width: "100%",
    height: 220,
    borderRadius: 15,
    overflow: "hidden",
    marginTop: 10,
    backgroundColor: "#ddd",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  removeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 20,
  },
  postBtn: {
    backgroundColor: "#007AFF",
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  // EVENTS
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  sectionLink: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "500",
  },
  eventsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  eventCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginRight: 6,
    alignItems: "center",
  },
  eventIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  eventLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  eventDate: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 2,
  },

  // TABS
  tabsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  tabPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    marginRight: 6,
  },
  tabPillActive: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#fff",
  },

  // RECOMMENDED
  recommendedSection: {
    marginBottom: 10,
  },
  recommendedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recommendedHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  recommendedHeaderLink: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  recommendedListContent: {
    paddingRight: 6,
  },
  recommendedCard: {
    width: 190,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    marginRight: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  recommendedImage: {
    width: "100%",
    height: 96,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  recommendedImagePlaceholder: {
    width: "100%",
    height: 96,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  recommendedTitle: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  recommendedMeta: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
  },
  recommendedErrorText: {
    fontSize: 12,
    color: "#EF4444",
    marginBottom: 6,
  },

  // FEED
  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  feedContent: {
    paddingBottom: 24,
  },
  errorText: {
    color: "#EF4444",
    marginBottom: 8,
    fontSize: 13,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 20,
  },

  postCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  postHighlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#007AFF",
    borderRadius: 16,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postHeaderText: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    fontSize: 14,
    color: "#111827",
  },
  time: {
    color: "#6B7280",
    fontSize: 12,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  postText: {
    marginVertical: 4,
    color: "#374151",
    fontSize: 14,
  },
  postImage: {
    width: "100%",
    height: 190,
    borderRadius: 12,
    marginTop: 6,
  },
  postFooterMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  likeCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },
  postActionItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  postActionLabel: {
    marginLeft: 4,
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "500",
  },
  commentCount: {
    fontSize: 12,
    color: "#6B7280",
  },
  commentsContainer: {
    overflow: "hidden",
    marginTop: 6,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  commentInput: {
    flex: 1,
    fontSize: 13,
    marginRight: 8,
  },
  commentSendBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  commentList: {
    marginTop: 6,
  },
  commentBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    fontSize: 12,
    color: "#111827",
  },
  commentsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  commentsBackdrop: {
    flex: 1,
  },
  commentsSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    maxHeight: "80%",
  },
  commentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  commentsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentsTitle: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  commentsCountText: {
    fontSize: 12,
    color: "#6B7280",
  },
  commentsPostPreview: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    marginBottom: 4,
  },
  commentsPostAuthor: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  commentsPostTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginTop: 2,
  },
  commentsPostText: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 2,
  },
  commentsList: {
    flexGrow: 0,
    marginTop: 4,
    marginBottom: 8,
  },
  commentsEmptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  commentsEmptyText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  commentsInputBar: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    paddingTop: 8,
  },
  commentsInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  commentsSendButton: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
  },
  commentsSendButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 4,
  },
  commentAvatarPlaceholder: {
    marginRight: 8,
  },
  commentBubbleContainer: {
    maxWidth: "88%",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  commentText: {
    fontSize: 13,
    color: "#111827",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});
