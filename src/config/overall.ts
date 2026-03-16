import { OverallWeights, Position, AttributeKey } from "@/types/builder";

const ALL_ATTRS: AttributeKey[] = [
  "closeShot",
  "drivingLayup",
  "drivingDunk",
  "standingDunk",
  "postControl",
  "midRange",
  "threePoint",
  "freeThrow",
  "passAccuracy",
  "ballHandle",
  "speedWithBall",
  "interiorDefense",
  "perimeterDefense",
  "steal",
  "block",
  "offensiveRebound",
  "defensiveRebound",
  "speed",
  "acceleration",
  "strength",
  "vertical"
];

/** Default weight when an attribute is not emphasized for a position (still counts toward overall). */
const BASE_WEIGHT = 0.5;

function weights(
  overrides: Partial<Record<AttributeKey, number>>
): Record<AttributeKey, number> {
  const out: Record<string, number> = {};
  for (const k of ALL_ATTRS) {
    out[k] = overrides[k] ?? BASE_WEIGHT;
  }
  return out as Record<AttributeKey, number>;
}

/**
 * Position-weighted overall. Every attribute contributes; position-specific weights emphasize key skills.
 * Formula: overall = sum(attr * weight) / sum(weight). So 99 is reachable when attributes are high.
 */
const byPosition: Record<Position, Partial<Record<AttributeKey, number>>> = {
  PG: weights({
    threePoint: 1.4,
    midRange: 1.1,
    passAccuracy: 1.5,
    ballHandle: 1.5,
    speedWithBall: 1.3,
    perimeterDefense: 1.1,
    steal: 1.0,
    speed: 1.2,
    acceleration: 1.2,
    drivingLayup: 1.0,
    freeThrow: 0.9
  }),
  SG: weights({
    threePoint: 1.5,
    midRange: 1.2,
    drivingDunk: 1.2,
    drivingLayup: 1.1,
    ballHandle: 1.1,
    perimeterDefense: 1.1,
    speed: 1.0,
    speedWithBall: 1.0,
    freeThrow: 1.0
  }),
  SF: weights({
    threePoint: 1.1,
    midRange: 1.1,
    drivingDunk: 1.2,
    interiorDefense: 1.1,
    perimeterDefense: 1.1,
    defensiveRebound: 1.0,
    speed: 1.0,
    strength: 1.0,
    drivingLayup: 1.0
  }),
  PF: weights({
    interiorDefense: 1.3,
    block: 1.2,
    offensiveRebound: 1.1,
    defensiveRebound: 1.3,
    strength: 1.3,
    standingDunk: 1.2,
    drivingDunk: 1.0,
    midRange: 0.9,
    closeShot: 1.0
  }),
  C: weights({
    interiorDefense: 1.4,
    block: 1.3,
    offensiveRebound: 1.2,
    defensiveRebound: 1.4,
    strength: 1.4,
    standingDunk: 1.3,
    closeShot: 1.1,
    drivingDunk: 1.0
  })
};

export const overallWeights: OverallWeights = {
  byPosition
};
