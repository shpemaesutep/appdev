// app/(tabs)/game/flappy/leaderboard.ts
import { addDoc, collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../../../utils/firebase";

export type LeaderboardEntry = {
  name: string;
  score: number;
  date?: any;
};

export async function saveScore(score: number, name: string) {
  if (score <= 0) return;

  await addDoc(collection(db, "leaderboard"), {
    name: name || "Anonymous User",
    score,
    date: new Date(),
  });
}

export async function fetchTopScores(topN: number = 5): Promise<LeaderboardEntry[]> {
  const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(topN));
  const snap = await getDocs(q);

  const scores: LeaderboardEntry[] = [];
  snap.forEach((d) => scores.push(d.data() as LeaderboardEntry));
  return scores;
}