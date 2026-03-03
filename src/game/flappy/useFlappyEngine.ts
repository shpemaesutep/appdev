// app/(tabs)/game/flappy/useFlappyEngine.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GAME, OBSTACLE, SCREEN } from "./constants";

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function randomObstacleHeight() {
  // We define the bottom pipe height; top is derived from gap + screen
  const usableHeight =
    SCREEN.height - GAME.floorHeight - GAME.ceilingPadding - GAME.obstacleGap;

  const bottomMin = OBSTACLE.minBottomHeight;
  const bottomMax = usableHeight - OBSTACLE.minTopHeight;

  return clamp(
    Math.floor(Math.random() * (bottomMax - bottomMin + 1) + bottomMin),
    bottomMin,
    bottomMax
  );
}

export type EngineState = {
  isGameOver: boolean;
  score: number;
  mascotY: number;       // bottom position (like your old mascotBottom)
  obstacleX: number;     // left position
  bottomPipeHeight: number;
  passed: boolean;       // used to count score once per pipe
};

export function useFlappyEngine() {
  // Public state for rendering
  const [state, setState] = useState<EngineState>(() => ({
    isGameOver: true,
    score: 0,
    mascotY: SCREEN.height * 0.52,
    obstacleX: SCREEN.width,
    bottomPipeHeight: randomObstacleHeight(),
    passed: false,
  }));

  // Internal refs for smooth updates without re-render every tick
  const runningRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastTRef = useRef<number | null>(null);

  const mascotYRef = useRef(state.mascotY);
  const velocityRef = useRef(0);
  const obstacleXRef = useRef(state.obstacleX);
  const bottomPipeHeightRef = useRef(state.bottomPipeHeight);
  const passedRef = useRef(false);
  const scoreRef = useRef(0);

  const syncToState = useCallback(() => {
    setState({
      isGameOver: !runningRef.current,
      score: scoreRef.current,
      mascotY: mascotYRef.current,
      obstacleX: obstacleXRef.current,
      bottomPipeHeight: bottomPipeHeightRef.current,
      passed: passedRef.current,
    });
  }, []);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTRef.current = null;
    syncToState();
  }, [syncToState]);

  const reset = useCallback(() => {
    velocityRef.current = 0;
    mascotYRef.current = SCREEN.height * 0.52;
    obstacleXRef.current = SCREEN.width;
    bottomPipeHeightRef.current = randomObstacleHeight();
    passedRef.current = false;
    scoreRef.current = 0;
  }, []);

  const start = useCallback(() => {
    reset();
    runningRef.current = true;
    syncToState();

    const tick = (t: number) => {
      if (!runningRef.current) return;

      const last = lastTRef.current ?? t;
      const dt = (t - last) / 1000; // seconds
      lastTRef.current = t;

      // ---- Physics: mascot ----
      // v = v - g*dt (downward), y = y + v*dt (y increases up in our bottom-position coordinate)
      velocityRef.current -= GAME.gravityPerSecond * dt;
      mascotYRef.current += velocityRef.current * dt;

      // Clamp mascot to floor/ceiling
      const minY = 0;
      const maxY = SCREEN.height - GAME.floorHeight - GAME.mascotSize;
      mascotYRef.current = clamp(mascotYRef.current, minY, maxY);

      // If mascot hits floor hard -> game over (optional feel)
      if (mascotYRef.current <= 0) {
        stop();
        return;
      }

      // ---- Obstacles movement ----
      obstacleXRef.current -= GAME.obstacleSpeed * dt;

      // If obstacle passed completely, reset
      if (obstacleXRef.current <= -GAME.obstacleWidth) {
        obstacleXRef.current = SCREEN.width;
        bottomPipeHeightRef.current = randomObstacleHeight();
        passedRef.current = false;
      }

      // ---- Scoring: when obstacle passes mascot ----
      const mascotLeft = GAME.mascotLeft;
      const mascotRight = mascotLeft + GAME.mascotSize;
      const obstacleRight = obstacleXRef.current + GAME.obstacleWidth;

      // If obstacle moved past mascot and we haven't counted yet
      if (!passedRef.current && obstacleRight < mascotLeft) {
        passedRef.current = true;
        scoreRef.current += 1;
      }

      // ---- Collision detection ----
      const obstacleLeft = obstacleXRef.current;
      const obstacleRightNow = obstacleXRef.current + GAME.obstacleWidth;

      const inXRange =
        obstacleLeft < mascotRight && obstacleRightNow > mascotLeft;

      if (inXRange) {
        // bottom pipe: from y=0 up to bottomPipeHeight
        const bottomPipeTop = bottomPipeHeightRef.current;

        // top pipe: from (bottomPipeHeight + gap) up to top of playable area
        const gapBottom = bottomPipeHeightRef.current;
        const gapTop = gapBottom + GAME.obstacleGap;

        const mascotBottom = mascotYRef.current;
        const mascotTop = mascotBottom + GAME.mascotSize;

        const hitsBottomPipe = mascotBottom < bottomPipeTop;
        const hitsTopPipe = mascotTop > gapTop;

        if (hitsBottomPipe || hitsTopPipe) {
          stop();
          return;
        }
      }

      // Reduce re-renders: update UI at ~30fps by only syncing sometimes
      // Here we sync every frame (still ok), but you can throttle if needed.
      syncToState();

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [reset, stop, syncToState]);

  const jump = useCallback(() => {
    if (!runningRef.current) return;
    // Give upward impulse (velocity positive increases y)
    velocityRef.current = GAME.jumpVelocity;
  }, []);

  const isRunning = useMemo(() => runningRef.current, [state.isGameOver]); // simple signal

  return {
    state,
    start,
    stop,
    jump,
    isRunning,
  };
}