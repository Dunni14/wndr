import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

const MapScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <MapView style={StyleSheet.absoluteFillObject} />
      <Text style={styles.logo}>WNDR</Text>
      {/* Later add memory pins using <Marker /> components */}
    </View>
  );
};

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

export default MapScreen; 