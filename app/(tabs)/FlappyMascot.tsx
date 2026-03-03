// app/(tabs)/FlappyMascot.tsx
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { GAME, SCREEN } from "../../src/game/flappy/constants";
import { styles } from "../../src/game/flappy/styles";
import { useFlappyEngine } from "../../src/game/flappy/useFlappyEngine";

// Firestore helpers
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { db } from "../../utils/firebase";

// If you still want to keep your typed entry:
type LeaderboardEntry = { name: string; score: number };

// Local type that includes doc id (needed for deletion)
type LeaderboardEntryWithId = LeaderboardEntry & { id: string };

export default function FlappyMascot() {
  const { state, start, jump } = useFlappyEngine();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntryWithId[]>([]);
  const [hasHandledGameOver, setHasHandledGameOver] = useState(false);

  // initials flow
  const [qualifies, setQualifies] = useState(false);
  const [initials, setInitials] = useState("");
  const [saving, setSaving] = useState(false);

  const isGameOver = state.isGameOver;

  // Background clouds (static, cheap depth)
  const clouds = useMemo(
    () => [
      { left: 24, top: 120, w: 120, h: 48, o: 0.14 },
      { left: SCREEN.width * 0.55, top: 160, w: 160, h: 56, o: 0.12 },
      { left: SCREEN.width * 0.2, top: 240, w: 190, h: 64, o: 0.1 },
    ],
    []
  );

  const fetchTop5WithIds = async (): Promise<LeaderboardEntryWithId[]> => {
    const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(5));
    const snap = await getDocs(q);

    const rows: LeaderboardEntryWithId[] = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        name: data.name ?? "???",
        score: typeof data.score === "number" ? data.score : 0,
      };
    });

    setLeaderboard(rows);
    return rows;
  };

  const qualifiesForTop5 = (score: number, top5: LeaderboardEntryWithId[]) => {
    // If fewer than 5 entries exist, any positive score qualifies
    if (top5.length < 5) return score > 0;

    // Must beat the 5th place score (ties do NOT qualify)
    const fifth = top5[top5.length - 1].score;
    return score > fifth;
  };

  const sanitizeInitials = (text: string) => {
    // letters/numbers only, uppercase, max 3
    const cleaned = text.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 3);
    setInitials(cleaned);
  };

  const pruneToTop5 = async () => {
    // Get top 5 docs
    const topQ = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(5));
    const topSnap = await getDocs(topQ);

    // If <= 5 docs exist, nothing to delete
    if (topSnap.size < 5) return;

    // Delete everything after the 5th doc
    const lastTopDoc = topSnap.docs[topSnap.docs.length - 1];

    const restQ = query(
      collection(db, "leaderboard"),
      orderBy("score", "desc"),
      startAfter(lastTopDoc)
    );
    const restSnap = await getDocs(restQ);

    await Promise.all(restSnap.docs.map((d) => deleteDoc(doc(db, "leaderboard", d.id))));
  };

  const submitInitials = async () => {
    if (!qualifies || saving) return;

    const nameToSave = (initials.trim() || "AAA").toUpperCase().slice(0, 3);

    setSaving(true);
    try {
      // Save score
      await addDoc(collection(db, "leaderboard"), {
        name: nameToSave,
        score: state.score,
        date: new Date(),
      });

      // Enforce only top 5
      await pruneToTop5();

      // Refresh UI
      await fetchTop5WithIds();

      // Close input
      setQualifies(false);
    } catch (e) {
      console.error("Error saving leaderboard score:", e);
    } finally {
      setSaving(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchTop5WithIds().catch((e) => console.error("Error fetching leaderboard", e));
  }, []);

  // When game ends: decide if they qualify. DO NOT auto-save.
  useEffect(() => {
    const handleGameOver = async () => {
      if (!isGameOver) {
        // reset flags when a new run starts
        setHasHandledGameOver(false);
        setQualifies(false);
        setInitials("");
        setSaving(false);
        return;
      }

      // run once per game over
      if (hasHandledGameOver) return;
      setHasHandledGameOver(true);

      if (state.score <= 0) {
        await fetchTop5WithIds();
        return;
      }

      const top5 = await fetchTop5WithIds();
      const q = qualifiesForTop5(state.score, top5);

      setQualifies(q); // if true, the modal will show initials input
    };

    handleGameOver().catch((e) => console.error("handleGameOver error", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver]);

  // Compute obstacle layout
  const bottomPipeHeight = state.bottomPipeHeight;
  const topPipeBottom = bottomPipeHeight + GAME.obstacleGap;
  const playableTop = SCREEN.height - GAME.floorHeight;
  const topPipeHeight = playableTop - topPipeBottom;

  return (
    <TouchableWithoutFeedback onPress={jump}>
      <LinearGradient colors={["#0b1020", "#122a55", "#2b7bbd"]} style={styles.container}>
        <View style={styles.gameArea}>
          {/* Clouds */}
          {clouds.map((c, i) => (
            <View
              key={i}
              style={[
                styles.cloud,
                {
                  left: c.left,
                  top: c.top,
                  width: c.w,
                  height: c.h,
                  opacity: c.o,
                },
              ]}
            />
          ))}

          {/* HUD */}
          <View style={styles.hud}>
            <Text style={styles.hudText}>Score {state.score}</Text>
          </View>

          {/* Mascot */}
          <Image
            source={require("../../assets/images/SHPEMaes.png")}
            style={[styles.mascot, { left: GAME.mascotLeft, bottom: state.mascotY }]}
            resizeMode="contain"
          />

          {/* Pipes */}
          <View style={[styles.pipe, { left: state.obstacleX, bottom: topPipeBottom, height: topPipeHeight }]} />
          <View style={[styles.pipe, { left: state.obstacleX, bottom: 0, height: bottomPipeHeight }]} />

          {/* Ground */}
          {/* <View style={styles.ground} /> */}

          {/* Overlay / Menu */}
          {isGameOver && (
            <View style={styles.overlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Game Over</Text>
                <Text style={styles.modalScore}>Score: {state.score}</Text>

                {/* ✅ Initials input only if qualifies */}
                {qualifies && (
                  <View
                    style={{
                      marginTop: 10,
                      borderRadius: 18,
                      padding: 14,
                      backgroundColor: "rgba(255,255,255,0.10)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.14)",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "900", textAlign: "center" }}>
                      Top 5! Enter Initials
                    </Text>

                    <TextInput
                      value={initials}
                      onChangeText={sanitizeInitials}
                      placeholder="ABC"
                      placeholderTextColor="rgba(255,255,255,0.55)"
                      autoCapitalize="characters"
                      maxLength={3}
                      style={{
                        marginTop: 10,
                        height: 48,
                        borderRadius: 14,
                        paddingHorizontal: 14,
                        backgroundColor: "rgba(0,0,0,0.25)",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.18)",
                        color: "white",
                        fontSize: 18,
                        fontWeight: "900",
                        letterSpacing: 3,
                        textAlign: "center",
                      }}
                    />

                    <TouchableOpacity
                      onPress={submitInitials}
                      disabled={saving}
                      style={{
                        marginTop: 10,
                        paddingVertical: 12,
                        borderRadius: 14,
                        alignItems: "center",
                        backgroundColor: "rgba(59,130,246,0.95)",
                        opacity: saving ? 0.6 : 1,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "900" }}>
                        {saving ? "SAVING..." : "SUBMIT"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.primaryBtn, { marginTop: 14 }]}
                  onPress={() => {
                    setHasHandledGameOver(false);
                    setQualifies(false);
                    setInitials("");
                    start();
                  }}
                >
                  <Text style={styles.primaryBtnText}>START GAME</Text>
                </TouchableOpacity>

                <View style={styles.leaderboard}>
                  <Text style={styles.leaderboardTitle}>🏆 Top 5 Scores</Text>
                  {leaderboard.length === 0 ? (
                    <Text style={styles.leaderboardRow}>No scores yet.</Text>
                  ) : (
                    leaderboard.map((item, index) => (
                      <Text key={item.id} style={styles.leaderboardRow}>
                        {index + 1}. {item.name} — {item.score}
                      </Text>
                    ))
                  )}
                </View>


              </View>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}