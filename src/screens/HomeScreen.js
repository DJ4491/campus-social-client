import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "https://campus-social-backend-1yfe.onrender.com/posts/";

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

export default function HomeScreen() {
  const [postText, setPostText] = useState("");
  const [image, setImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setError(null);
      const res = await fetch(API_URL);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Error fetching posts", err?.message || err);
      setError(`Could not load posts: ${err?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
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
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });

      const data = await res.json();
      console.log(data);

      setPostText("");
      setImage(null);
      Alert.alert("Post uploaded!");
    } catch (err) {
      console.log(err);
      Alert.alert("Upload failed");
    }
  };

  const canPost = postText.trim().length > 0 || image !== null;

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.avatar }} style={styles.profilePic} />
        <View style={styles.postHeaderText}>
          <Text style={styles.name}>{item.author}</Text>
          <Text style={styles.time}>{formatRelativeTime(item.created_at)}</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={18} color="#8E8E93" />
      </View>

      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postText}>{item.desc}</Text>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.postImage} />
      ) : null}

      <View style={styles.postFooterMeta}>
        <Text style={styles.likeCount}>{item.likes ?? 0} likes</Text>
      </View>

      <View style={styles.postActions}>
        <View style={styles.postActionItem}>
          <Ionicons name="heart-outline" size={18} color="#007AFF" />
          <Text style={styles.postActionLabel}>Like</Text>
        </View>
        <View style={styles.postActionItem}>
          <Ionicons name="chatbubble-outline" size={18} color="#007AFF" />
          <Text style={styles.postActionLabel}>Comment</Text>
        </View>
        <View style={styles.postActionItem}>
          <Ionicons name="share-outline" size={18} color="#007AFF" />
          <Text style={styles.postActionLabel}>Share</Text>
        </View>
      </View>
    </View>
  );

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
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=1" }}
            style={styles.profilePicSmall}
          />
        </View>
      </View>

      {/* APP TITLE */}
      <View style={styles.titleRow}>
        <View style={styles.logoCircle}>
          <Ionicons name="school-outline" size={20} color="#fff" />
        </View>
        <Text style={styles.title}>Campus Social</Text>
      </View>

      {/* WHAT'S ON YOUR MIND */}
      <View style={styles.composerCard}>
        {/* TOP ROW */}
        <View style={styles.postInputContainer}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=1" }}
            style={styles.inputProfile}
          />

          <TextInput
            placeholder="What's on your mind?"
            value={postText}
            onChangeText={setPostText}
            style={styles.postInput}
            multiline
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
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Post</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* UPCOMING EVENTS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <Text style={styles.sectionLink}>All</Text>
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
        ].map((event, i) => (
          <View key={i} style={styles.eventCard}>
            <View
              style={[
                styles.eventIconWrapper,
                { backgroundColor: event.color },
              ]}
            >
              <Ionicons name={event.icon} size={18} color="#fff" />
            </View>
            <Text style={styles.eventLabel}>{event.label}</Text>
            <Text style={styles.eventDate}>{event.date}</Text>
          </View>
        ))}
      </View>

      {/* FEED FILTER TABS */}
      <View style={styles.tabsRow}>
        <View style={[styles.tabPill, styles.tabPillActive]}>
          <Text style={[styles.tabText, styles.tabTextActive]}>All</Text>
        </View>
        <View style={styles.tabPill}>
          <Text style={styles.tabText}>Announcements</Text>
        </View>
        <View style={styles.tabPill}>
          <Text style={styles.tabText}>Campus News</Text>
        </View>
        <View style={styles.tabPill}>
          <Text style={styles.tabText}>Lost &amp; Found</Text>
        </View>
      </View>

      {/* POSTS FEED */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.feedContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No posts yet. Be the first to share!
              </Text>
            }
          />
        </>
      )}
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
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginRight: 8,
    alignItems: "center",
  },
  eventIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  eventLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  eventDate: {
    fontSize: 11,
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
    justifyContent: "flex-end",
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
});
