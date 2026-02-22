import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function VideoCallScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.remote} />
      <View style={styles.local} />
      <Text style={styles.hint}>Tap to mute / end call</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  remote: { flex: 1, backgroundColor: "#111" },
  local: {
    width: 120,
    height: 160,
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: "#222",
    borderRadius: 8,
  },
  hint: { position: "absolute", top: 40, alignSelf: "center", color: "#fff" },
});
