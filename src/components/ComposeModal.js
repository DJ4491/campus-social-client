import React, { useState } from "react";
import { Modal, View, StyleSheet, TextInput, Button } from "react-native";
import { SPACING, COLORS } from "../styles/theme";

export default function ComposeModal({ visible, onClose, onPost }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onPost({ content: text });
    setText("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TextInput
            placeholder="Write a post..."
            value={text}
            onChangeText={setText}
            multiline
            style={styles.input}
          />
          <View style={styles.row}>
            <Button title="Cancel" onPress={onClose} />
            <Button title="Post" onPress={submit} color={COLORS.primary} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  container: {
    backgroundColor: "#fff",
    padding: SPACING.m,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  input: { minHeight: 120, textAlignVertical: "top", padding: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.s,
  },
});
