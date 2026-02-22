import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../src/styles/theme";

export default function ChatBubble({ text, isMine }) {
  return (
    <View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
      <Text style={{ color: isMine ? "#fff" : COLORS.text }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    padding: 10,
    marginVertical: 6,
    maxWidth: "80%",
    borderRadius: 12,
  },
  mine: { backgroundColor: COLORS.primary, alignSelf: "flex-end" },
  theirs: { backgroundColor: "#EFEFEF", alignSelf: "flex-start" },
});
