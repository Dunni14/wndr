import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { fetchMemories } from "../services/api";

const MapScreen = () => {
  const [memories, setMemories] = useState([]);

  useEffect(() => {
    fetchMemories().then(setMemories);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView style={StyleSheet.absoluteFillObject}>
        {/* Example: Render memory pins here in the future */}
        {memories.map((mem) => (
          <Marker
            key={mem.id}
            coordinate={{ latitude: mem.latitude, longitude: mem.longitude }}
          />
        ))}
      </MapView>
      <Text style={styles.logo}>WNDR</Text>
      {/* Bottom nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonText}>Challenges</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonText}>Memories</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonText}>Friends</Text>
        </TouchableOpacity>
      </View>
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
    zIndex: 10,
  },
  navBar: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 12,
    elevation: 4,
    zIndex: 10,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
  },
  navButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
});

export default MapScreen; 