import { AttributeDependencyRule } from "@/types/builder";

/**
 * Configurable attribute dependency rules.
 * When source attribute meets threshold, dependent attribute gets a floor (or ratio-based floor).
 * Applied in calculation layer so dependent values are raised automatically when source increases.
 */
export const attributeDependencyRules: AttributeDependencyRule[] = [
  // Driving Layup → Close Shot floor (finishing synergy)
  {
    dependent: "closeShot",
    source: "drivingLayup",
    type: "floor",
    sourceThreshold: 70,
    floorValue: 60
  },
  {
    dependent: "closeShot",
    source: "drivingLayup",
    type: "floor",
    sourceThreshold: 85,
    floorValue: 74
  },
  // Driving Dunk → Vertical minimum (elite dunking requires bounce)
  {
    dependent: "vertical",
    source: "drivingDunk",
    type: "ratio",
    ratio: 0.8,
    sourceThreshold: 70
  },
  {
    dependent: "vertical",
    source: "drivingDunk",
    type: "floor",
    sourceThreshold: 90,
    floorValue: 78
  },
  // Ball Handle → Speed With Ball floor
  {
    dependent: "speedWithBall",
    source: "ballHandle",
    type: "ratio",
    ratio: 0.85,
    sourceThreshold: 70
  },
  // Interior Defense → Block synergy
  {
    dependent: "block",
    source: "interiorDefense",
    type: "ratio",
    ratio: 0.82,
    sourceThreshold: 70
  },
  // Offensive Rebound → Defensive Rebound floor
  {
    dependent: "defensiveRebound",
    source: "offensiveRebound",
    type: "ratio",
    ratio: 0.9,
    sourceThreshold: 65
  },
  // Three-Point → Mid-Range minimum (shooting consistency)
  {
    dependent: "midRange",
    source: "threePoint",
    type: "floor",
    sourceThreshold: 80,
    floorValue: 74
  },
  {
    dependent: "midRange",
    source: "threePoint",
    type: "ratio",
    ratio: 0.92,
    sourceThreshold: 90
  },
  // Pass Accuracy supports Ball Handle floors at high tiers
  {
    dependent: "ballHandle",
    source: "passAccuracy",
    type: "ratio",
    ratio: 0.84,
    sourceThreshold: 78
  }
];
