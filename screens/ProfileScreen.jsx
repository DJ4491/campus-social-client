import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../components/Avatar";
import { useAuthContext } from "../hooks/use-auth-context";
import { COLORS, SPACING } from "../src/styles/theme";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const { signOut: authSignOut, session, profile: contextProfile } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    friends: 0,
    posts: 0,
    likes: 0,
  });
  const [friends, setFriends] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [session, contextProfile]);

  // Show message: try web alert first (works on web), fallback to React Native Alert (iOS/Android)
  const showAlert = (title, message) => {
    try {
      if (typeof window !== "undefined" && typeof window.alert === "function") {
        window.alert(message ? `${title}\n${message}` : title);
        return;
      }
    } catch (e) {
      // fallback
    }
    Alert.alert(title, message || undefined);
  };

  const runLogout = async () => {
    console.log("[ProfileScreen] User confirmed Log Out, calling authSignOut...");
    setLoggingOut(true);
    try {
      await authSignOut();
      console.log("[ProfileScreen] authSignOut() completed successfully");
      showAlert("Logged out", "You have been signed out.");
    } catch (error) {
      setLoggingOut(false);
      console.error("[ProfileScreen] Logout error:", error);
      showAlert("Error", "Failed to log out. Please try again.");
    }
  };

  const handleLogout = () => {
    console.log("[ProfileScreen] Log Out button pressed, showing confirm dialog");
    const message = "Are you sure you want to log out?";
    // Try web confirm first (works on web); fallback to React Native Alert (e.g. Android/iOS or old Android)
    try {
      if (typeof window !== "undefined" && typeof window.confirm === "function") {
        const confirmed = window.confirm(message);
        if (confirmed) {
          runLogout();
        } else {
          console.log("[ProfileScreen] Log Out cancelled");
        }
        return;
      }
    } catch (e) {
      console.log("[ProfileScreen] window.confirm not available, using Alert.alert");
    }
    Alert.alert(
      "Log Out",
      message,
      [
        { text: "Cancel", style: "cancel", onPress: () => console.log("[ProfileScreen] Log Out cancelled") },
        { text: "Log Out", style: "destructive", onPress: runLogout },
      ],
      { cancelable: true },
    );
  };

  async function loadProfileData() {
    try {
      setLoading(true);

      // Get current user from context
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const user = session.user;

      // Set profile data from context or session
      const profileInfo = {
        name:
          contextProfile?.full_name ||
          contextProfile?.username ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "User", 
        username: contextProfile?.username || user.email?.split("@")[0] || "user",
        bio: contextProfile?.bio || "Hey – Welcome to Campus Social!",
        avatar:
          contextProfile?.avatar_url ||
          user.user_metadata?.avatar_url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(contextProfile?.username || user.email?.split("@")[0] || "User")}`,
      };
      setProfile(profileInfo);

      // Mock data - no database queries
      // In production, these would come from your backend API
      setRecentPosts([]);
      setStats({
        friends: 0,
        posts: 0,
        likes: 0,
      });
      setFriends([]);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Unable to load profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { name, username, bio, avatar } = profile;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar uri={avatar} size={32} />
            <View style={styles.headerText}>
              <Text style={styles.headerName}>{name}</Text>
              <Text style={styles.headerUsername}>@{username}</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons
              name="ellipsis-horizontal"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Avatar uri={avatar} size={120} />
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.username}>@{username}</Text>
          <Text style={styles.bio}>{bio}</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.friends}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.likes}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
        </View>

        {/* Friends Section */}
        {friends.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Friends</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See all</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.friendsList}
            >
              {friends.map((friend) => (
                <View key={friend.id} style={styles.friendItem}>
                  <Avatar uri={friend.avatar} size={64} />
                  <Text style={styles.friendName}>{friend.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Posts Section */}
        {recentPosts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent posts</Text>
              <TouchableOpacity>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.text}
                />
              </TouchableOpacity>
            </View>
            {recentPosts.map((post) => (
              <TouchableOpacity key={post.id} style={styles.postCard}>
                {post.image && (
                  <Image
                    source={{ uri: post.image }}
                    style={styles.postImage}
                  />
                )}
                <View style={styles.postContent}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postDescription} numberOfLines={2}>
                    {post.description}
                  </Text>
                  <View style={styles.postLikes}>
                    <Ionicons name="heart" size={16} color="#E74C3C" />
                    <Text style={styles.postLikesText}>{post.likes} Likes</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {recentPosts.length === 0 && friends.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="person-outline" size={64} color={COLORS.muted} />
            <Text style={styles.emptyStateText}>No posts or friends yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start connecting with your campus!
            </Text>
          </View>
        )}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={[styles.logoutButton, loggingOut && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            disabled={loggingOut}
            activeOpacity={0.8}
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color="#E74C3C" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.m,
    color: COLORS.muted,
    fontSize: 16,
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    marginLeft: SPACING.s,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  headerUsername: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 2,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.l,
    paddingBottom: SPACING.m,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: SPACING.m,
  },
  username: {
    fontSize: 16,
    color: COLORS.muted,
    marginTop: 4,
  },
  bio: {
    fontSize: 15,
    color: COLORS.text,
    textAlign: "center",
    marginTop: SPACING.m,
    paddingHorizontal: SPACING.l,
    lineHeight: 22,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: 20,
    marginTop: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
    marginRight: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.l,
    marginHorizontal: SPACING.l,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E9F0",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E9F0",
  },
  section: {
    paddingTop: SPACING.l,
    paddingHorizontal: SPACING.l,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "600",
    marginRight: 4,
  },
  friendsList: {
    paddingRight: SPACING.l,
  },
  friendItem: {
    alignItems: "center",
    marginRight: SPACING.m,
    width: 80,
  },
  friendName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: SPACING.s,
    textAlign: "center",
  },
  postCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: SPACING.m,
    overflow: "hidden",
    minHeight: 100,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  postImage: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.muted + "20",
  },
  postContent: {
    flex: 1,
    padding: SPACING.m,
    justifyContent: "space-between",
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  postDescription: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
    marginBottom: SPACING.s,
  },
  postLikes: {
    flexDirection: "row",
    alignItems: "center",
  },
  postLikesText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 6,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.l,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: SPACING.m,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: SPACING.s,
    textAlign: "center",
  },
  logoutSection: {
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.l,
    marginTop: SPACING.l,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.l,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E74C3C",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E74C3C",
    marginLeft: SPACING.s,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
});
