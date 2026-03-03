// app/(tabs)/game/flappy/styles.ts
import { StyleSheet } from "react-native";
import { GAME } from "./constants";

export const styles = StyleSheet.create({
  container: { flex: 1 },

  gameArea: {
    flex: 1,
    overflow: "hidden",
  },

  // HUD pill
  hud: {
    position: "absolute",
    top: 54,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    zIndex: 10,
  },
  hudText: { color: "white", fontWeight: "800", fontSize: 16 },

  mascot: {
    position: "absolute",
    width: GAME.mascotSize,
    height: GAME.mascotSize,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  pipe: {
    position: "absolute",
    width: GAME.obstacleWidth,
    borderRadius: 16,
    backgroundColor: "rgba(34, 197, 94, 0.95)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.20)",
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  // Ground
//   ground: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     bottom: 0,
//     height: GAME.floorHeight,
//     backgroundColor: "rgba(0,0,0,0.18)",
//     borderTopWidth: 1,
//     borderTopColor: "rgba(255,255,255,0.14)",
//   },

  // clouds
  cloud: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
  },

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 26,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  modalTitle: {
    fontSize: 34,
    color: "white",
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
  },
  modalScore: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },

  primaryBtn: {
    backgroundColor: "rgba(59,130,246,0.95)",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "900" },

  leaderboard: {
    marginTop: 16,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  leaderboardTitle: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  leaderboardRow: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginVertical: 3,
    fontWeight: "700",
  },
});