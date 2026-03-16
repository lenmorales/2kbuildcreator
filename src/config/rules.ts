import { BuilderRulesConfig, Position } from "@/types/builder";
import {
  globalBodyLimits,
  positionBodyLimits,
  wingspanRule,
  bodyLimitsByPositionHeight
} from "@/config/bodyLimits";
import { attributeDefinitions, attributeGroups } from "@/config/attributes";
import { getBadgeDefinitionsFromJson } from "@/data/guidelineData";
import { overallWeights } from "@/config/overall";
import { overallNormalizationRules } from "@/config/overallNormalization";
import { archetypeRules } from "@/config/archetypes";
import { attributeDependencyRules } from "@/config/attributeDependencies";
import { attributeCostCurves } from "@/config/attributeCosts";

// Approximate, editable caps by position
const baseAttributeCapsByPosition: BuilderRulesConfig["baseAttributeCapsByPosition"] =
  {
    PG: {
      threePoint: 98,
      midRange: 96,
      passAccuracy: 99,
      ballHandle: 99,
      speedWithBall: 98,
      perimeterDefense: 92,
      steal: 92,
      speed: 97,
      acceleration: 97,
      drivingLayup: 95,
      drivingDunk: 87
    },
    SG: {
      threePoint: 97,
      midRange: 95,
      drivingDunk: 95,
      drivingLayup: 94,
      passAccuracy: 95,
      ballHandle: 96,
      speedWithBall: 95,
      perimeterDefense: 94,
      steal: 93,
      speed: 95,
      acceleration: 95
    },
    SF: {
      threePoint: 93,
      midRange: 94,
      drivingDunk: 95,
      standingDunk: 92,
      interiorDefense: 92,
      perimeterDefense: 92,
      defensiveRebound: 94,
      speed: 90,
      strength: 90
    },
    PF: {
      threePoint: 88,
      midRange: 92,
      drivingDunk: 96,
      standingDunk: 98,
      interiorDefense: 97,
      block: 97,
      offensiveRebound: 97,
      defensiveRebound: 98,
      speed: 87,
      strength: 97
    },
    C: {
      threePoint: 84,
      midRange: 88,
      drivingDunk: 96,
      standingDunk: 99,
      interiorDefense: 99,
      block: 99,
      offensiveRebound: 99,
      defensiveRebound: 99,
      speed: 82,
      acceleration: 80,
      strength: 99
    }
  };

// Height: taller = more interior/block/standing dunk/rebound; shorter = more speed/ball handle/speed with ball/shooting
const heightModifiers: BuilderRulesConfig["heightModifiers"] = {
  speed: { reference: 76, perInchAbove: -2.15, perInchBelow: 2.15 },
  acceleration: { reference: 76, perInchAbove: -1.9, perInchBelow: 1.9 },
  drivingDunk: { reference: 78, perInchAbove: 1.4, perInchBelow: -1.2 },
  standingDunk: { reference: 80, perInchAbove: 2.2, perInchBelow: -2 },
  perimeterDefense: { reference: 76, perInchAbove: 0.6, perInchBelow: -0.6 },
  interiorDefense: { reference: 80, perInchAbove: 1.5, perInchBelow: -1.2 },
  block: { reference: 80, perInchAbove: 1.8, perInchBelow: -1.4 },
  speedWithBall: { reference: 75, perInchAbove: -1.5, perInchBelow: 1.4 },
  ballHandle: { reference: 75, perInchAbove: -1.05, perInchBelow: 1.05 },
  threePoint: { reference: 76, perInchAbove: -0.72, perInchBelow: 0.72 },
  midRange: { reference: 76, perInchAbove: -0.5, perInchBelow: 0.5 },
  offensiveRebound: { reference: 80, perInchAbove: 1.75, perInchBelow: -1.2 },
  defensiveRebound: { reference: 80, perInchAbove: 1.95, perInchBelow: -1.35 },
  vertical: { reference: 76, perInchAbove: -0.6, perInchBelow: 0.6 }
};

// Wingspan: longer = more defense/block/steal/finishing; shorter = more shooting/playmaking
const wingspanModifiers: BuilderRulesConfig["wingspanModifiers"] = {
  steal: { referenceOffset: 0, perInchAbove: 1.5, perInchBelow: -1.5 },
  block: { referenceOffset: 0, perInchAbove: 1.95, perInchBelow: -1.85 },
  interiorDefense: { referenceOffset: 0, perInchAbove: 1.45, perInchBelow: -1.25 },
  perimeterDefense: {
    referenceOffset: 0,
    perInchAbove: 1.05,
    perInchBelow: -1.05
  },
  threePoint: { referenceOffset: 0, perInchAbove: -0.95, perInchBelow: 0.95 },
  midRange: { referenceOffset: 0, perInchAbove: -0.7, perInchBelow: 0.7 },
  ballHandle: { referenceOffset: 0, perInchAbove: -0.85, perInchBelow: 0.85 },
  speedWithBall: { referenceOffset: 0, perInchAbove: -0.75, perInchBelow: 0.75 },
  passAccuracy: { referenceOffset: 0, perInchAbove: -0.45, perInchBelow: 0.45 },
  drivingLayup: { referenceOffset: 0, perInchAbove: 0.65, perInchBelow: -0.55 },
  drivingDunk: { referenceOffset: 0, perInchAbove: 0.9, perInchBelow: -0.8 },
  standingDunk: { referenceOffset: 0, perInchAbove: 1.1, perInchBelow: -0.95 },
  offensiveRebound: { referenceOffset: 0, perInchAbove: 1.2, perInchBelow: -1.05 },
  defensiveRebound: { referenceOffset: 0, perInchAbove: 1.25, perInchBelow: -1.1 }
};

// Weight: heavier = more strength/interior; lighter = more speed/acceleration
const weightModifiers: BuilderRulesConfig["weightModifiers"] = {
  strength: { reference: 210, perPoundAbove: 0.24, perPoundBelow: -0.24 },
  speed: { reference: 210, perPoundAbove: -0.18, perPoundBelow: 0.18 },
  acceleration: { reference: 210, perPoundAbove: -0.14, perPoundBelow: 0.14 },
  interiorDefense: { reference: 230, perPoundAbove: 0.17, perPoundBelow: -0.17 },
  block: { reference: 230, perPoundAbove: 0.12, perPoundBelow: -0.12 },
  standingDunk: { reference: 220, perPoundAbove: 0.14, perPoundBelow: -0.14 },
  offensiveRebound: { reference: 230, perPoundAbove: 0.13, perPoundBelow: -0.13 },
  defensiveRebound: { reference: 230, perPoundAbove: 0.13, perPoundBelow: -0.13 },
  vertical: { reference: 220, perPoundAbove: -0.08, perPoundBelow: 0.08 }
};

// Total potential budget tuned so a focused build can reach 99 overall (with normalized formula)
export const MAX_POINTS = 1850;

export const defaultRulesConfig: BuilderRulesConfig = {
  globalBodyLimits,
  positionBodyLimits,
  bodyLimitsByPositionHeight,
  wingspanRule,
  attributeDefinitions,
  attributeGroups,
  baseAttributeCapsByPosition,
  heightModifiers,
  wingspanModifiers,
  weightModifiers,
  attributeDependencyRules,
  attributeCostCurves,
  overallWeights,
  overallNormalization: overallNormalizationRules,
  badges: getBadgeDefinitionsFromJson(),
  archetypeRules,
  maxPoints: MAX_POINTS,
  targetOverall: 99
};

export const defaultPositionForOverall: Position = "PG";

