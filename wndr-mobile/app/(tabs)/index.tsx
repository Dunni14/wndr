import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function HomeTab() {
  return (
    <View style={{ flex: 1 }}>
      <MapView style={StyleSheet.absoluteFillObject} />
      <Text style={styles.logo}>WNDR</Text>
      {/* Add memory pins with <Marker /> here in the future */}
      {/* Add nav bar/header here if needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
}); 