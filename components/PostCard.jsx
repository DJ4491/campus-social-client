import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS, SPACING } from "../src/styles/theme";
import Avatar from "./Avatar";

export default function PostCard({ post }) {
  // post: { user:{display_name, avatar_url}, content, image_url, created_at }
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Avatar uri={post.user?.avatar_url} size={44} />
        <View style={{ marginLeft: SPACING.s, flex: 1 }}>
          <Text style={styles.name}>
            {post.user?.display_name || post.user?.username}
          </Text>
          <Text style={styles.time}>
            {new Date(post.created_at).toLocaleString()}
          </Text>
        </View>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.image_url ? (
        <Image source={{ uri: post.image_url }} style={styles.image} />
      ) : null}

      <View style={styles.actions}>
        <Text style={styles.actionText}>Like</Text>
        <Text style={styles.actionText}>Comment</Text>
        <Text style={styles.actionText}>Share</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    marginVertical: 8,
    padding: SPACING.m,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    elevation: 1,
  },
  row: { flexDirection: "row", alignItems: "center" },
  name: { fontWeight: "600", color: COLORS.text },
  time: { color: COLORS.muted, fontSize: 12 },
  content: { marginTop: 12, color: COLORS.text },
  image: { marginTop: 12, height: 180, borderRadius: 10, width: "100%" },
  actions: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
  },
  actionText: { color: COLORS.primary, fontWeight: "600" },
});
