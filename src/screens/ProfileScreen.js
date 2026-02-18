
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      
      {/* Avatar */}
      <Image
        source={{ uri: "https://i.pravatar.cc/300" }}
        style={styles.avatar}
      />

      {/* Welcome Text */}
      <Text style={styles.title}>Welcome 👋</Text>
      <Text style={styles.subtitle}>We are happy to see you here</Text>

      {/* Buttons */}
      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Terms & Policy</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
     backgroundColor: "#d2d8e7",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  avatar: {
    width: 130,
    height: 130,
    borderRadius: 100,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#57e48b",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#141111",
  },

  subtitle: {
    fontSize: 14,
    color: "#0b1929",
    marginBottom: 30,
  },

  btn: {
    width: "80%",
     backgroundColor: "#6366f1",
    padding: 14,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: "center",
  },

  btnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});













