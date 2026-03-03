// app/(tabs)/game/flappy/constants.ts
import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const SCREEN = { width: screenWidth, height: screenHeight };

// Game tuning
export const GAME = {
  gravityPerSecond: 1400,     // px/s^2 feel (engine uses dt)
  jumpVelocity: 520,          // px/s upward impulse
  obstacleSpeed: 260,         // px/s
  obstacleWidth: 64,
  obstacleGap: 210,
  mascotSize: 46,
  mascotLeft: 44,
  floorHeight: 80,
  ceilingPadding: 40,
};

// How often we spawn a new obstacle height
export const OBSTACLE = {
  minTopHeight: 60,
  minBottomHeight: 60,
};