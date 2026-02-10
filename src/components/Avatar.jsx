import React from "react";
import { View, Image, StyleSheet } from "react-native";

export default function Avatar({ uri, size = 48 }) {
    return (
        <View style={[styles.container, { widthX: size, height: size, borderRadius: size / 2 }]}>
            {uri ? (
                <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
            ) : (
                <View style={[styles.placeholder, { borderRadius: size / 2 }]} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { overflow: "hidden" },
    placeholder: {
        flex: 1,
        backgroundColor: "#DDEFF6",
    },
});
