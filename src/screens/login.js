
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [image, setImage] = useState(null);

  // image picker
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // login / signup handler
  const handleSubmit = () => {
    if (!form.email || !form.password || (!isLogin && !form.name)) {
      Alert.alert("Please fill all fields");
      return;
    }

    setUser({
      name: form.name || "User",
      email: form.email,
      image,
    });

    setForm({ name: "", email: "", password: "" });
  };

  // logout
  const logout = () => {
    setUser(null);
    setImage(null);
  };

  // ================= PROFILE VIEW =================
  if (user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.profileBox}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={{
                uri:
                  user.image ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>

          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.btnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ================= LOGIN / SIGNUP =================
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>
        {isLogin ? "Login" : "Create Account"}
      </Text>

      {!isLogin && (
        <TextInput
          placeholder="Name"
          style={styles.input}
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
        />
      )}

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={form.email}
        onChangeText={(t) => setForm({ ...form, email: t })}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={form.password}
        onChangeText={(t) => setForm({ ...form, password: t })}
      />

      {!isLogin && (
        <TouchableOpacity onPress={pickImage}>
          <Text style={styles.uploadText}>Upload Profile Photo</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.mainBtn} onPress={handleSubmit}>
        <Text style={styles.btnText}>
          {isLogin ? "Login" : "Sign Up"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.switchText}>
          {isLogin
            ? "Don't have account? Sign up"
            : "Already have account? Login"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ================= STYLES =================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#a0b1dc",
  },
  heading: {
    fontSize: 26,
    color: "black",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#2e3e5a",
    padding: 12,
    marginBottom: 12,
    marginLeft: 12,
    marginRight: 12,
    borderRadius: 10,
    color: "white",
  },
  mainBtn: {
    backgroundColor: "#6366f1",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    marginLeft: 12,
    marginRight: 12,
  },
  btnText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  switchText: {
    color: "black",
    textAlign: "center",
    marginTop: 15,
  },
  uploadText: {
    color: "#60a5fa",
    textAlign: "center",
    marginBottom: 10,
  },
  profileBox: {
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 100,
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
  },
  email: {
    color: "#253a57",
    marginBottom: 20,
  },
  logoutBtn: {
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 10,
    width: 150,
  },
});














