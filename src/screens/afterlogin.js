






import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState(null);

  // pick image/video
  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia(result.assets[0].uri);
    }
  };

  // add post
  const addPost = () => {
    if (!media) return;

    const newPost = {
      id: Date.now().toString(),
      uri: media,
      caption,
    };

    setPosts([newPost, ...posts]);
    setMedia(null);
    setCaption("");
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>MySocial</Text>
        <Image
          source={{ uri: "https://i.pravatar.cc/150" }}
          style={styles.avatar}
        />
      </View>

      {/* POST BOX */}
      <View style={styles.postBox}>
        <TextInput
          placeholder="Write caption..."
          placeholderTextColor="#aaa"
          style={styles.input}
          value={caption}
          onChangeText={setCaption}
        />

        <View style={styles.row}>
          <TouchableOpacity style={styles.pickBtn} onPress={pickMedia}>
            <Text style={styles.btnText}>Pick Media</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.postBtn} onPress={addPost}>
            <Text style={styles.btnText}>Post</Text>
          </TouchableOpacity>
        </View>

        {media && <Image source={{ uri: media }} style={styles.preview} />}
      </View>

      {/* FEED */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.uri }} style={styles.postImg} />
            <Text style={styles.caption}>{item.caption}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#222",
  },

  logo: { color: "#fff", fontSize: 22, fontWeight: "bold" },

  avatar: { width: 40, height: 40, borderRadius: 50 },

  postBox: { padding: 15 },

  input: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    padding: 10,
    color: "#fff",
    marginBottom: 10,
  },

  row: { flexDirection: "row", justifyContent: "space-between" },

  pickBtn: {
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 10,
  },

  postBtn: {
    backgroundColor: "#0ea5e9",
    padding: 10,
    borderRadius: 10,
  },

  btnText: { color: "#fff", fontWeight: "bold" },

  preview: {
    width: "100%",
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },

  card: { margin: 15 },

  postImg: {
    width: "100%",
    height: 300,
    borderRadius: 10,
  },

  caption: { color: "#fff", marginTop: 8 },
});



