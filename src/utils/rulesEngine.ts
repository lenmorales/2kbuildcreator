import {
  AttributeCaps,
  AttributeValues,
  BadgeDefinition,
  BadgeTier,
  BodyLimits,
  BodySettings,
  BuilderRulesConfig,
  Position
} from "@/types/builder";
import { defaultRulesConfig } from "@/config/rules";

export const RULES: BuilderRulesConfig = defaultRulesConfig;

const GLOBAL_HEIGHT_MIN = RULES.globalBodyLimits?.height.minInches ?? 69;
const GLOBAL_HEIGHT_MAX = RULES.globalBodyLimits?.height.maxInches ?? 88;

export function getPositionBodyLimits(
  position: Position,
  height?: number
): BodyLimits {
  const base = RULES.positionBodyLimits[position];
  const heightMin = Math.max(base.height.min, GLOBAL_HEIGHT_MIN);
  const heightMax = Math.min(base.height.max, GLOBAL_HEIGHT_MAX);
  const useHeight = height ?? heightMin;
  const wingspanRange = getWingspanRangeForHeight(useHeight, position);

  let weightMin = base.weight.min;
  let weightMax = base.weight.max;
  const bodyRow = RULES.bodyLimitsByPositionHeight?.get(position, useHeight);
  if (bodyRow) {
    weightMin = bodyRow.weightMin;
    weightMax = bodyRow.weightMax;
  }

  return {
    height: { min: heightMin, max: heightMax, step: 1 },
    weight: { min: weightMin, max: weightMax, step: 1 },
    wingspan: { ...wingspanRange, step: 1 }
  };
}

/** Wingspan range for a given height. Uses capsDropDowns when available, else offsets. */
export function getWingspanRangeForHeight(
  height: number,
  position?: Position
): { min: number; max: number } {
  if (position && RULES.bodyLimitsByPositionHeight) {
    const row = RULES.bodyLimitsByPositionHeight.get(position, height);
    if (row) return { min: row.wingMin, max: row.wingMax };
  }
  if (position) {
    const posLimits = RULES.positionBodyLimits[position];
    const offset = posLimits.wingspanOffset;
    if (offset) {
      return {
        min: height + offset.minOffset,
        max: height + offset.maxOffset
      };
    }
  }
  const { minOffset, maxOffset } = RULES.wingspanRule;
  return { min: height + minOffset, max: height + maxOffset };
}

export function clampBodySettings(
  settings: BodySettings
): { clamped: BodySettings; clampedFields: (keyof BodySettings)[] } {
  let clamped: BodySettings = { ...settings };
  const clampedFields: (keyof BodySettings)[] = [];

  const clampScalar = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));

  const initialLimits = getPositionBodyLimits(settings.position, settings.height);
  const nextHeight = clampScalar(
    settings.height,
    initialLimits.height.min,
    initialLimits.height.max
  );
  if (nextHeight !== settings.height) clampedFields.push("height");
  clamped.height = nextHeight;

  // Recompute legal ranges after height clamp so weight/wingspan are validated
  // against the final body shape (prevents invalid position-height combos).
  const limits = getPositionBodyLimits(settings.position, nextHeight);
  const wingspanRange = getWingspanRangeForHeight(nextHeight, settings.position);

  const nextWeight = clampScalar(
    settings.weight,
    limits.weight.min,
    limits.weight.max
  );
  if (nextWeight !== settings.weight) clampedFields.push("weight");
  clamped.weight = nextWeight;

  const nextWingspan = clampScalar(
    settings.wingspan,
    wingspanRange.min,
    wingspanRange.max
  );
  if (nextWingspan !== settings.wingspan) clampedFields.push("wingspan");
  clamped.wingspan = nextWingspan;

  return { clamped, clampedFields };
}

/**
 * Compute attribute caps using formula (fallback when API caps not yet loaded).
 * Use caps from API when available - pass them to deriveState.
 */
export function computeAttributeCaps(settings: BodySettings): AttributeCaps {
  const { position, height, weight, wingspan } = settings;
  const result: AttributeCaps = {} as AttributeCaps;
  for (const def of RULES.attributeDefinitions) {
    const key = def.key;
    const baseByPos = RULES.baseAttributeCapsByPosition[position] ?? {};
    const base = baseByPos[key] ?? def.max;

    let cap = base;

    const hMod = RULES.heightModifiers[key];
    if (hMod) {
      const delta = height - hMod.reference;
      cap += delta > 0 ? delta * hMod.perInchAbove : delta * hMod.perInchBelow;
    }

    const wMod = RULES.weightModifiers[key];
    if (wMod) {
      const delta = weight - wMod.reference;
      cap +=
        delta > 0 ? delta * wMod.perPoundAbove : delta * wMod.perPoundBelow;
    }

    const wsMod = RULES.wingspanModifiers[key];
    if (wsMod) {
      const ref = height + wsMod.referenceOffset;
      const delta = wingspan - ref;
      cap +=
        delta > 0 ? delta * wsMod.perInchAbove : delta * wsMod.perInchBelow;
    }

    const clamped = Math.max(def.min, Math.min(def.max, Math.round(cap)));
    result[key] = clamped;
  }

  return result;
}

/** Apply dependency rules: raise dependent attributes to at least their computed floor (max of all applicable rules). */
export function applyAttributeDependencies(
  values: AttributeValues
): { values: AttributeValues; raisedKeys: (keyof AttributeValues)[] } {
  const floors: Partial<Record<keyof AttributeValues, number>> = {};

  for (const rule of RULES.attributeDependencyRules) {
    const sourceVal = values[rule.source];
    if (sourceVal < rule.sourceThreshold) continue;

    let floor: number;
    if (rule.type === "floor" && rule.floorValue != null) {
      floor = rule.floorValue;
    } else if (rule.type === "ratio" && rule.ratio != null) {
      floor = Math.floor(sourceVal * rule.ratio);
    } else continue;

    const existing = floors[rule.dependent];
    floors[rule.dependent] = existing == null ? floor : Math.max(existing, floor);
  }

  const next: AttributeValues = { ...values };
  const raisedKeys: (keyof AttributeValues)[] = [];
  for (const [key, floor] of Object.entries(floors)) {
    const k = key as keyof AttributeValues;
    if (next[k] < floor!) {
      next[k] = floor!;
      raisedKeys.push(k);
    }
  }
  return { values: next, raisedKeys };
}

export function clampAttributesToCaps(
  values: AttributeValues,
  caps: AttributeCaps
): { clamped: AttributeValues; clampedKeys: (keyof AttributeValues)[] } {
  const next: AttributeValues = { ...values };
  const clampedKeys: (keyof AttributeValues)[] = [];

  for (const def of RULES.attributeDefinitions) {
    const key = def.key;
    const current = values[key];
    const cap = caps[key];
    const clampedValue = Math.min(current, cap);
    if (clampedValue !== current) clampedKeys.push(key);
    next[key] = clampedValue;
  }

  return { clamped: next, clampedKeys };
}

/** Apply dependencies then clamp to caps. Returns final values and which keys were raised or clamped. */
export function applyDependenciesAndCaps(
  values: AttributeValues,
  caps: AttributeCaps
): {
  values: AttributeValues;
  raisedByDependency: (keyof AttributeValues)[];
  clampedByCap: (keyof AttributeValues)[];
} {
  const { values: afterDeps, raisedKeys } = applyAttributeDependencies(values);
  const { clamped, clampedKeys } = clampAttributesToCaps(afterDeps, caps);
  return {
    values: clamped,
    raisedByDependency: raisedKeys,
    clampedByCap: clampedKeys
  };
}

export function createDefaultAttributes(): AttributeValues {
  const values: Partial<AttributeValues> = {};
  for (const def of RULES.attributeDefinitions) {
    values[def.key] = def.min;
  }
  return values as AttributeValues;
}

/** Cost for a single attribute point at value (1-based cost for going from value-1 to value). */
function pointCostAtValue(
  attributeKey: keyof AttributeValues,
  value: number,
  body?: BodySettings
): number {
  const curve = RULES.attributeCostCurves.find((c) => c.attributeKey === attributeKey);
  if (!curve) return 1;
  let multiplier = 1;
  for (const tier of curve.tiers) {
    if (value >= tier.min && value <= tier.max) {
      multiplier = tier.multiplier;
      break;
    }
  }
  let contextualMultiplier = 1;

  if (body) {
    const isSmallGuard = (body.position === "PG" || body.position === "SG") && body.height <= 75;
    const isBig = body.position === "PF" || body.position === "C";

    // Premium guard creation attributes for bigger players.
    if (
      ["threePoint", "ballHandle", "speedWithBall", "speed", "acceleration"].includes(
        attributeKey
      ) &&
      isBig
    ) {
      contextualMultiplier *= 1.2;
      if (body.position === "C") contextualMultiplier *= 1.08;
    }

    // Standing dunk is significantly more expensive for smaller guards.
    if (attributeKey === "standingDunk" && (body.position === "PG" || body.position === "SG")) {
      contextualMultiplier *= 1.4;
      if (isSmallGuard) contextualMultiplier *= 1.22;
    }

    // Interior/rebounding tools are costlier for small guards.
    if (
      ["interiorDefense", "block", "offensiveRebound", "defensiveRebound"].includes(attributeKey) &&
      (body.position === "PG" || body.position === "SG")
    ) {
      contextualMultiplier *= 1.24;
    }

    // Elite premium zone gets even pricier from 90+.
    if (value >= 90 && ["threePoint", "ballHandle", "speed", "acceleration"].includes(attributeKey)) {
      contextualMultiplier *= 1.2;
    }
    if (value >= 93 && ["threePoint", "ballHandle"].includes(attributeKey)) {
      contextualMultiplier *= 1.18;
    }
  }

  return curve.baseCost * curve.attributeMultiplier * multiplier * contextualMultiplier;
}

/** Total cost for an attribute from min to its current value (sum of point costs). */
export function computePointsUsed(values: AttributeValues, body?: BodySettings): number {
  let sum = 0;
  for (const def of RULES.attributeDefinitions) {
    const min = def.min;
    const value = Math.max(min, values[def.key]);
    for (let v = min + 1; v <= value; v++) {
      sum += pointCostAtValue(def.key, v, body);
    }
  }
  return Math.round(sum);
}

/** Total value required to complete the current legal build (all attributes at current body-valid caps). */
export function computeTotalValueCapacity(
  caps: AttributeCaps,
  body?: BodySettings
): number {
  let sum = 0;
  for (const def of RULES.attributeDefinitions) {
    const min = def.min;
    const cap = Math.max(min, caps[def.key]);
    for (let v = min + 1; v <= cap; v++) {
      sum += pointCostAtValue(def.key, v, body);
    }
  }
  return Math.round(sum);
}

/** Spendable budget for this body: total legal capacity scaled by completion ratio. */
export function computeBuildBudget(
  caps: AttributeCaps,
  body?: BodySettings
): number {
  const legalCapacity = computeTotalValueCapacity(caps, body);
  const scaled = Math.round(
    legalCapacity * RULES.overallNormalization.completionBudgetRatio
  );
  return Math.max(1, Math.min(legalCapacity, scaled));
}

/** Raw remaining value (can be negative if overspent). */
export function computeRemainingPointsRaw(
  values: AttributeValues,
  caps: AttributeCaps,
  body?: BodySettings
): number {
  const used = computePointsUsed(values, body);
  const budget = computeBuildBudget(caps, body);
  return budget - used;
}

export function computeRemainingPoints(
  values: AttributeValues,
  caps: AttributeCaps,
  body?: BodySettings
): number {
  return Math.max(0, computeRemainingPointsRaw(values, caps, body));
}

/** 0..1 completion progress against the current build's legal capped budget. */
export function computeCompletionProgress(
  values: AttributeValues,
  caps: AttributeCaps,
  body?: BodySettings
): number {
  const used = computePointsUsed(values, body);
  const budget = computeBuildBudget(caps, body);
  if (budget <= 0) return 0;
  return Math.max(0, Math.min(1, used / budget));
}

function getOverallWeightFor(
  position: Position,
  key: keyof AttributeValues
): number {
  const weights = RULES.overallWeights.byPosition[position];
  return weights?.[key] ?? 0.5;
}

/**
 * Best weighted score reachable under budget using legal caps.
 * Uses marginal weighted gain per cost to approximate optimal tradeoff spending.
 */
function computeBestWeightedScoreAtBudget(
  position: Position,
  caps: AttributeCaps,
  budget: number,
  body?: BodySettings
): number {
  const minValues = createDefaultAttributes();
  let spent = 0;
  const working = { ...minValues };

  // Greedy marginal allocation: each +1 goes to the best gain-per-cost next point.
  while (true) {
    let bestKey: keyof AttributeValues | null = null;
    let bestScore = -Infinity;
    let bestCost = 0;
    for (const def of RULES.attributeDefinitions) {
      const key = def.key;
      const current = working[key];
      const cap = caps[key];
      if (current >= cap) continue;
      const nextValue = current + 1;
      const cost = pointCostAtValue(key, nextValue, body);
      if (spent + cost > budget + 1e-6) continue;
      const weight = getOverallWeightFor(position, key);
      const marginal = weight / Math.max(1e-6, cost);
      if (marginal > bestScore) {
        bestScore = marginal;
        bestKey = key;
        bestCost = cost;
      }
    }
    if (!bestKey) break;
    working[bestKey] += 1;
    spent += bestCost;
  }

  return computeWeightedScore(position, working);
}

function computeWeightedScore(
  position: Position,
  values: AttributeValues
): number {
  const weights = RULES.overallWeights.byPosition[position];
  if (!weights) return 0;
  let weighted = 0;
  let totalWeight = 0;
  for (const def of RULES.attributeDefinitions) {
    const w = weights[def.key] ?? 0.5;
    if (w <= 0) continue;
    weighted += values[def.key] * w;
    totalWeight += w;
  }
  if (totalWeight === 0) return 0;
  return weighted / totalWeight;
}

/** Overall = normalized weighted progression + budget progression against body-valid caps. */
export function computeOverallRating(
  position: Position,
  values: AttributeValues,
  caps?: AttributeCaps,
  body?: BodySettings
): number {
  const minOverall = RULES.overallNormalization.minOverall;
  const maxOverall = RULES.overallNormalization.maxOverall;

  if (!caps) {
    const raw = computeWeightedScore(position, values);
    return Math.round(Math.max(minOverall, Math.min(maxOverall, raw)));
  }

  const minValues = createDefaultAttributes();
  const minRaw = computeWeightedScore(position, minValues);
  const budget = computeBuildBudget(caps, body);
  const maxRaw = computeBestWeightedScoreAtBudget(position, caps, budget, body);
  const currentRaw = computeWeightedScore(position, values);
  const rawDenom = Math.max(1e-6, maxRaw - minRaw);
  const weightedProgressUnderBudget = Math.max(
    0,
    Math.min(1, (currentRaw - minRaw) / rawDenom)
  );

  const budgetProgress = computeCompletionProgress(values, caps, body);

  // Must satisfy BOTH: smart weighted quality and full budget completion.
  const completion = Math.min(weightedProgressUnderBudget, budgetProgress);
  const scaled = minOverall + completion * (maxOverall - minOverall);
  let overall = Math.round(scaled);
  if (completion < 0.999 && overall >= maxOverall) overall = maxOverall - 1;
  return Math.max(minOverall, Math.min(maxOverall, overall));
}

const TIER_ORDER: Exclude<BadgeTier, "none">[] = [
  "bronze",
  "silver",
  "gold",
  "hallOfFame",
  "legend"
];

export function computeBadgeTier(
  badge: BadgeDefinition,
  values: AttributeValues,
  heightInches?: number
): BadgeTier {
  if (heightInches != null) {
    if (
      badge.heightMinInches != null &&
      heightInches < badge.heightMinInches
    )
      return "none";
    if (
      badge.heightMaxInches != null &&
      heightInches > badge.heightMaxInches
    )
      return "none";
  }

  let best: BadgeTier = "none";
  for (const threshold of badge.thresholds) {
    const meets = Object.entries(threshold.requirements).every(
      ([key, minVal]) => values[key as keyof AttributeValues] >= (minVal ?? 0)
    );
    if (meets) best = threshold.tier;
  }

  if (
    heightInches != null &&
    best !== "none" &&
    badge.maxTierByHeight &&
    Object.keys(badge.maxTierByHeight).length > 0
  ) {
    const maxTierIdx = badge.maxTierByHeight[heightInches];
    if (maxTierIdx != null) {
      const tierIdx = TIER_ORDER.indexOf(best);
      if (tierIdx >= maxTierIdx) {
        best = TIER_ORDER[maxTierIdx - 1] ?? "bronze";
      }
    }
  }

  return best;
}

export function computeAllBadges(
  values: AttributeValues,
  body?: BodySettings
): Record<string, BadgeTier> {
  const result: Record<string, BadgeTier> = {};
  const height = body?.height;
  for (const badge of RULES.badges) {
    result[badge.id] = computeBadgeTier(badge, values, height);
  }
  return result;
}

export function computeArchetype(
  position: Position,
  values: AttributeValues,
  caps?: AttributeCaps,
  body?: BodySettings
): string {
  const catTotals: Record<string, { sum: number; count: number }> = {};
  for (const group of RULES.attributeGroups) {
    for (const key of group.attributeKeys) {
      const v = values[key];
      if (!catTotals[group.id]) catTotals[group.id] = { sum: 0, count: 0 };
      catTotals[group.id].sum += v;
      catTotals[group.id].count += 1;
    }
  }
  const catAvg: Record<string, number> = {};
  for (const [id, t] of Object.entries(catTotals)) {
    catAvg[id] = t.sum / t.count;
  }
  const overall = computeOverallRating(position, values, caps, body);
  let bestRule: { name: string; score: number } | null = null;
  for (const rule of RULES.archetypeRules) {
    if (rule.positionSpecific && !rule.positionSpecific.includes(position)) continue;
    if (rule.minOverall != null && overall < rule.minOverall) continue;
    let score = 0;
    if (rule.emphasize) {
      for (const [cat, weight] of Object.entries(rule.emphasize)) {
        score += (catAvg[cat] ?? 0) * (weight ?? 1);
      }
    }
    if (!bestRule || score > bestRule.score) bestRule = { name: rule.name, score };
  }
  return bestRule?.name ?? "Balanced Prototype";
}
