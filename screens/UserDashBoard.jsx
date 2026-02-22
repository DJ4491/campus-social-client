import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function ProfileDetails({ navigation }) {
  const [name, setName] = useState("Mahendra");
  const [email, setEmail] = useState("mahendra@gmail.com");
  const [branch, setBranch] = useState("IT");
  const [bio, setBio] = useState("Dream big 🚀");

  const [edit, setEdit] = useState(false);

  const [image, setImage] = useState("https://i.pravatar.cc/300");

  // pick profile image
  const pickImage = async () => {
    if (!edit) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      {/* PROFILE IMAGE */}
      <TouchableOpacity onPress={pickImage}>
        <Image source={{ uri: image }} style={styles.avatar} />
        {edit && <Text style={styles.changeText}>Tap to change</Text>}
      </TouchableOpacity>

      {/* NAME */}
      <TextInput
        style={styles.input}
        value={name}
        editable={edit}
        onChangeText={setName}
      />

      {/* EMAIL */}
      <TextInput
        style={styles.input}
        value={email}
        editable={edit}
        onChangeText={setEmail}
      />

      {/* BRANCH */}
      <TextInput
        style={styles.input}
        value={branch}
        editable={edit}
        onChangeText={setBranch}
      />

      {/* BIO */}
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={bio}
        editable={edit}
        onChangeText={setBio}
        multiline
      />

      {/* EDIT BUTTON */}
      <TouchableOpacity style={styles.btn} onPress={() => setEdit(!edit)}>
        <Text style={styles.btnText}>
          {edit ? "Save Profile" : "Edit Profile"}
        </Text>
      </TouchableOpacity>

      {/* LOGOUT */}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: "#4d5a9d" }]}
        onPress={() => navigation.replace("Login")}
      >
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#a0b1dc", padding: 20 },

  title: {
    color: "#181414",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 100,
    alignSelf: "center",
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#5d7a88",
  },

  changeText: {
    color: "#181616",
    textAlign: "center",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#636c6e",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    color: "#200e0e",
  },

  btn: {
    backgroundColor: "#504bb8",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },

  btnText: { color: "#fff", fontWeight: "bold" },
});
