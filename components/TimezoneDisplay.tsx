import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";

const API_BASE =
  Platform.select({
    ios: "http://localhost:8000",
    android: "http://10.0.2.2:8000",
    web: "http://127.0.0.1:8000",
    default: "http://localhost:8000",
  }) || "http://localhost:8000";

export default function TimezoneDisplay() {
  const [timeInfo, setTimeInfo] = useState(null);

  useEffect(() => {
    const fetchTZ = async () => {
      try {
        const res = await fetch(`${API_BASE}/timezone`);
        if (!res.ok) {
          console.log("TZ fetch failed", res.status);
          setTimeInfo({ error: "Could not fetch timezone" });
          return;
        }
        const data = await res.json();
        setTimeInfo(data);
      } catch (err) {
        console.log("Error fetching timezone:", err);
        setTimeInfo({ error: String(err) });
      }
    };

    fetchTZ();

    // refresh every 60s (optional)
    const id = setInterval(fetchTZ, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.container}>
      {timeInfo ? (
        timeInfo.error ? (
          <Text style={styles.text}>TZ: {timeInfo.error}</Text>
        ) : (
          <Text style={styles.text}>
            {timeInfo.current_time} ({timeInfo.timezone})
          </Text>
        )
      ) : (
        <Text style={styles.text}>Loading timezone...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});
