import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [showOverlay, setShowOverlay] = useState(true);

  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        // Keep native splash briefly so nothing flashes
        await new Promise((r) => setTimeout(r, 300));

        // Show your custom loading screen for a minimum time
        await new Promise((r) => setTimeout(r, 1200));

        // Hide native splash BEFORE fading overlay (so overlay is what user sees)
        await SplashScreen.hideAsync();

        // Fade out overlay
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1.06,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (mounted) setShowOverlay(false);
        });
      } catch (e) {
        // Even if something goes wrong, never block the app
        console.warn(e);
        try {
          await SplashScreen.hideAsync();
        } catch {}
        if (mounted) setShowOverlay(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [opacity, scale]);

  return (
    <View style={styles.container}>
      {/* Your actual app */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>

      {/* Loading overlay */}
      {showOverlay && (
        <Animated.View
          // IMPORTANT: allow interaction with app even if overlay lingers
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.overlay,
            { opacity },
          ]}
        >
          <Animated.Image
            source={require("../assets/images/shpemaeslogo.png")}
            resizeMode="contain"
            style={[styles.logo, { transform: [{ scale }] }]}
          />
          <Text style={styles.title}>SHPE • MAES UTEP</Text>
          <Text style={styles.sub}>Loading…</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },
  overlay: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 220, height: 220, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  sub: { fontSize: 13, opacity: 0.6 },
});