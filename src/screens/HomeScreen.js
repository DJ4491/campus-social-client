import { useState } from "react";
import { FlatList, SafeAreaView, StyleSheet } from "react-native";
import ComposeModal from "../components/ComposeModal";
import FloatingActionButton from "../components/FloatingActionButton";
import PostCard from "../components/PostCard";

const demoPosts = [
  {
    id: "1",
    content: "Hello campus!",
    created_at: new Date().toISOString(),
    user: { display_name: "Anu" },
  },
  {
    id: "2",
    content: "Club meeting today.",
    created_at: new Date().toISOString(),
    user: { display_name: "Ravi" },
  },
];

export default function HomeScreen() {
  const [posts, setPosts] = useState(demoPosts);
  const [composeOpen, setComposeOpen] = useState(false);

  const openCompose = () => setComposeOpen(true);
  const closeCompose = () => setComposeOpen(false);

  const addPost = ({ content }) => {
    setPosts([
      {
        id: Math.random().toString(),
        content,
        created_at: new Date().toISOString(),
        user: { display_name: "You" },
      },
      ...posts,
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <PostCard post={item} />}
      />
      <FloatingActionButton onPress={openCompose} />
      <ComposeModal
        visible={composeOpen}
        onClose={closeCompose}
        onPost={addPost}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 12 } });
