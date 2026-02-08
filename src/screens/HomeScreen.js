import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { View, Text, StyleSheet, Image, FlatList, TextInput, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const demoPosts = [
 {
    id: "1",
    name: "Sarah Lee",
    time: "1 hr",
    profile: "https://i.pravatar.cc/150?img=5",
    content: "Join us at the Coding Bootcamp! Beginners are welcome!",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
  },
  {
    id: "2",
    name: "Jason Kim",
    time: "Science Dept.",
    profile: "https://i.pravatar.cc/150?img=12",
    content: "Astronomy workshop this Friday! View stars with high-powered telescopes!",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa"
  }
];

export default function HomeScreen() {

  const [postText, setPostText] = useState("");
  const [image, setImage] = useState(null);

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
    const res = await fetch("https://your-backend-api.com/posts", {
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
        <Image source={{ uri: item.profile }} style={styles.profilePic} />
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>

      <Text style={styles.postText}>{item.content}</Text>
      <Image source={{ uri: item.image }} style={styles.postImage} />

      <View style={styles.postActions}>
        <Text>❤️ 67</Text>
        <Text>💬 25</Text>
        <Text>👍 Like</Text>
        <Text>🔄 Share</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Image source={{ uri: "https://i.pravatar.cc/150?img=1" }} style={styles.profilePicSmall}/>
        <TextInput placeholder="Search posts..." style={styles.search}/>
        <Ionicons name="notifications" size={24} color="#007AFF" />
      </View>

      {/* APP TITLE */}
      <Text style={styles.title}>Campus Social</Text>

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
      <Image source={{ uri: image }} style={styles.previewImage} resizeMode="contain" />
      <TouchableOpacity style={styles.removeBtn} onPress={() => setImage(null)}>
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



      {/* EVENTS */}
      <View style={styles.eventsRow}>
        {["Tech Talk", "Sports Meet", "Job Fair", "Hackathon"].map((event, i) => (
          <View key={i} style={styles.eventCard}>
            <Text>{event}</Text>
          </View>
        ))}
      </View>

      {/* POSTS FEED */}
      <FlatList
        data={demoPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />

      {/* BOTTOM NAV
      <View style={styles.bottomNav}>
        <Ionicons name="home" size={26} color="#007AFF" />
        <Ionicons name="calendar" size={26} />
        <Ionicons name="add-circle" size={50} color="#007AFF" />
        <Ionicons name="chatbubble" size={26} />
        <Ionicons name="person" size={26} />
      </View> */}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa", padding: 10 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  profilePicSmall: { width: 35, height: 35, borderRadius: 20 },
  search: { flex: 1, backgroundColor: "#eaeaea", marginHorizontal: 10, padding: 8, borderRadius: 20 },

  title: { fontSize: 22, fontWeight: "bold", marginVertical: 10 },

  statusBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 10, borderRadius: 10, marginBottom: 10 },

  eventsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  eventCard: { backgroundColor: "#fff", padding: 10, borderRadius: 10 },

  postCard: { backgroundColor: "#fff", padding: 10, borderRadius: 10, marginBottom: 10 },
  postHeader: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  profilePic: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  name: { fontWeight: "bold" },
  time: { color: "gray", fontSize: 12 },

  postText: { marginVertical: 5 },
  postImage: { width: "100%", height: 180, borderRadius: 10, marginTop: 5 },

  postActions: { flexDirection: "row", justifyContent: "space-around", marginTop: 8 },

  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 10 },

  postInputContainer: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#fff",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 25,
  marginVertical: 10,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 5,
  elevation: 2
},

inputProfile: {
  width: 38,
  height: 38,
  borderRadius: 20,
  marginRight: 10
},

postInput: {
  flex: 1,
  fontSize: 14,
  maxHeight: 80
},

inputIcons: {
  flexDirection: "row",
  alignItems: "center",
  marginLeft: 10
},

sendBtn: {
  backgroundColor: "#007AFF",
  padding: 8,
  borderRadius: 20,
  marginLeft: 8
},

previewContainer: {
  width: "100%",
  aspectRatio: 1.5,   // keeps image proportional
  borderRadius: 15,
  overflow: "hidden",
  marginBottom: 10,
  backgroundColor: "#eee"
},

previewImage: {
  width: "100%",
  height: "100%",
  resizeMode: "cover"
},

removeBtn: {
  position: "absolute",
  top: 8,
  right: 8,
  backgroundColor: "rgba(0,0,0,0.6)",
  padding: 6,
  borderRadius: 20
},

composerCard: {
  backgroundColor: "#fff",
  borderRadius: 15,
  padding: 12,
  marginBottom: 12,
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 5,
  elevation: 2
},

postInputContainer: {
  flexDirection: "row",
  alignItems: "center"
},

inputProfile: {
  width: 38,
  height: 38,
  borderRadius: 20,
  marginRight: 10
},

postInput: {
  flex: 1,
  fontSize: 14,
  maxHeight: 80
},

previewWrapper: {
  width: "100%",
  height: 220,
  borderRadius: 15,
  overflow: "hidden",
  marginTop: 10,
  backgroundColor: "#ddd"
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
  borderRadius: 20
},

postBtn: {
  backgroundColor: "#007AFF",
  marginTop: 10,
  paddingVertical: 10,
  borderRadius: 10,
  alignItems: "center"
}




});
