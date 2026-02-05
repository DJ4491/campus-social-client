import React from "react";
import { SafeAreaView, FlatList } from "react-native";
import ChatBubble from "../components/ChatBubble";

const messages = [
  { id: "1", text: "Hello!", mine: false },
  { id: "2", text: "Hi, how are you?", mine: true },
];

export default function ChatScreen() {
  return (
    <SafeAreaView style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={messages}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <ChatBubble text={item.text} isMine={item.mine} />
        )}
      />
    </SafeAreaView>
  );
}
