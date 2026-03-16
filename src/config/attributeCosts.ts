import { AttributeKey, AttributeCostCurve, CostTier } from "@/types/builder";

// Shared tier breakpoints: 25-60 cheap, 61-75 moderate, 76-85 expensive, 86-92 very expensive, 93-99 elite
const DEFAULT_TIERS: CostTier[] = [
  { min: 25, max: 60, multiplier: 1 },
  { min: 61, max: 75, multiplier: 1.65 },
  { min: 76, max: 85, multiplier: 2.45 },
  { min: 86, max: 92, multiplier: 3.6 },
  { min: 93, max: 99, multiplier: 5.25 }
];

const PREMIUM_TIERS: CostTier[] = [
  { min: 25, max: 60, multiplier: 1.1 },
  { min: 61, max: 75, multiplier: 1.9 },
  { min: 76, max: 85, multiplier: 2.95 },
  { min: 86, max: 92, multiplier: 4.5 },
  { min: 93, max: 99, multiplier: 6.8 }
];

const CHEAP_TIERS: CostTier[] = [
  { min: 25, max: 60, multiplier: 0.7 },
  { min: 61, max: 75, multiplier: 1 },
  { min: 76, max: 85, multiplier: 1.35 },
  { min: 86, max: 92, multiplier: 1.9 },
  { min: 93, max: 99, multiplier: 2.55 }
];

function curve(
  attributeKey: AttributeKey,
  baseCost: number,
  attributeMultiplier: number,
  tiers: CostTier[] = DEFAULT_TIERS
): AttributeCostCurve {
  return { attributeKey, baseCost, attributeMultiplier, tiers };
}

/**
 * Weighted attribute cost curves. Higher attributeMultiplier = more expensive to upgrade.
 * Elite attributes (ball handle, 3PT, speed, standing dunk for small builds, etc.) use higher multipliers.
 */
export const attributeCostCurves: AttributeCostCurve[] = [
  // Finishing
  curve("closeShot", 1, 0.95),
  curve("drivingLayup", 1, 1.05),
  curve("drivingDunk", 1, 1.22, PREMIUM_TIERS),
  curve("standingDunk", 1, 1.55, PREMIUM_TIERS), // standing dunk is especially premium
  curve("postControl", 1, 1.05),
  // Shooting – three-point and mid-range expensive at high tiers
  curve("midRange", 1, 1.15),
  curve("threePoint", 1, 1.65, PREMIUM_TIERS),
  curve("freeThrow", 1, 0.42, CHEAP_TIERS), // intentionally much cheaper than elite 3PT
  // Playmaking – ball handle expensive at elite levels
  curve("passAccuracy", 1, 1.08),
  curve("ballHandle", 1, 1.6, PREMIUM_TIERS),
  curve("speedWithBall", 1, 1.38, PREMIUM_TIERS),
  // Defense
  curve("interiorDefense", 1, 1.22),
  curve("perimeterDefense", 1, 1.12),
  curve("steal", 1, 1.25, PREMIUM_TIERS),
  curve("block", 1, 1.28, PREMIUM_TIERS),
  curve("offensiveRebound", 1, 1.14),
  curve("defensiveRebound", 1, 1.16),
  // Physicals – speed/acceleration expensive at breakpoints
  curve("speed", 1, 1.5, PREMIUM_TIERS),
  curve("acceleration", 1, 1.45, PREMIUM_TIERS),
  curve("strength", 1, 1.15),
  curve("vertical", 1, 1.22)
];
