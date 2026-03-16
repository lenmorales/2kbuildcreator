export type Position = "PG" | "SG" | "SF" | "PF" | "C";

export type AttributeCategory =
  | "finishing"
  | "shooting"
  | "playmaking"
  | "defense"
  | "physical";

export type AttributeKey =
  | "closeShot"
  | "drivingLayup"
  | "drivingDunk"
  | "standingDunk"
  | "postControl"
  | "midRange"
  | "threePoint"
  | "freeThrow"
  | "passAccuracy"
  | "ballHandle"
  | "speedWithBall"
  | "interiorDefense"
  | "perimeterDefense"
  | "steal"
  | "block"
  | "offensiveRebound"
  | "defensiveRebound"
  | "speed"
  | "acceleration"
  | "strength"
  | "vertical";

export interface AttributeDefinition {
  key: AttributeKey;
  label: string;
  category: AttributeCategory;
  min: number;
  max: number;
  step: number;
}

export interface AttributeGroup {
  id: AttributeCategory;
  label: string;
  attributeKeys: AttributeKey[];
}

export type BadgeTier =
  | "none"
  | "bronze"
  | "silver"
  | "gold"
  | "hallOfFame"
  | "legend";

export type BadgeCategory =
  | "finishing"
  | "shooting"
  | "playmaking"
  | "defense"
  | "general";

export interface BadgeThreshold {
  tier: Exclude<BadgeTier, "none">;
  requirements: Partial<Record<AttributeKey, number>>;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  thresholds: BadgeThreshold[];
  /** Min height (inches) for badge eligibility. If set, player must be >= this. */
  heightMinInches?: number;
  /** Max height (inches) for badge eligibility. If set, player must be <= this. */
  heightMaxInches?: number;
  /** Max tier index (1=bronze, 2=silver, etc.) per height. Caps tier at that height. */
  maxTierByHeight?: Record<number, number>;
}

export interface BodySettings {
  position: Position;
  height: number; // inches
  weight: number; // lbs
  wingspan: number; // inches
}

export interface BodyLimits {
  height: { min: number; max: number; step: number };
  weight: { min: number; max: number; step: number };
  wingspan: { min: number; max: number; step: number };
}

export interface PositionBodyLimits {
  position: Position;
  height: { min: number; max: number };
  weight: { min: number; max: number };
  /** Wingspan range for this position, as offset from height (minOffset, maxOffset). */
  wingspanOffset?: { minOffset: number; maxOffset: number };
}

/** Global body limits applied across all positions. */
export interface GlobalBodyLimits {
  height: { minInches: number; maxInches: number };
}

export interface WingspanRule {
  minOffset: number;
  maxOffset: number;
}

export type AttributeCaps = Record<AttributeKey, number>;

export type AttributeValues = Record<AttributeKey, number>;

export interface CapRuleContext {
  position: Position;
  height: number;
  weight: number;
  wingspan: number;
}

export interface AttributeCapRule {
  baseByPosition: Partial<Record<Position, number>>;
  heightModifier?: (height: number, ctx: CapRuleContext) => number;
  weightModifier?: (weight: number, ctx: CapRuleContext) => number;
  wingspanModifier?: (wingspan: number, ctx: CapRuleContext) => number;
}

export type AttributeCapRules = Partial<Record<AttributeKey, AttributeCapRule>>;

export interface OverallWeights {
  byPosition: Record<Position, Partial<Record<AttributeKey, number>>>;
}

export interface OverallNormalizationRules {
  /** Starting overall when all attributes are at minimum. */
  minOverall: number;
  /** Cap of normalized overall. */
  maxOverall: number;
  /**
   * Fraction of total legal-cap value used as spendable build budget.
   * < 1 means you must sacrifice some capped ratings to optimize toward 99.
   */
  completionBudgetRatio: number;
}

export interface ArchetypeRule {
  id: string;
  name: string;
  description?: string;
  positionSpecific?: Position[];
  emphasize?: Partial<Record<AttributeCategory, number>>;
  minOverall?: number;
}

/** Rule that raises the floor of a dependent attribute based on a source attribute. */
export interface AttributeDependencyRule {
  /** Attribute that gets a higher floor when source is high. */
  dependent: AttributeKey;
  /** Attribute that drives the floor. */
  source: AttributeKey;
  /** When source >= threshold, dependent's floor becomes at least floorValue (or source * ratio). */
  type: "floor" | "ratio";
  /** For type "floor": minimum value for dependent when source meets threshold. */
  floorValue?: number;
  /** For type "ratio": dependent floor = source * ratio (e.g. 0.85). */
  ratio?: number;
  /** Source must be >= this for the rule to apply. */
  sourceThreshold: number;
}

/** Cost tier: cost per point in this range = baseCost * multiplier. */
export interface CostTier {
  min: number;
  max: number;
  multiplier: number;
}

/** Per-attribute cost curve: tiers 25-60 cheap, 61-75 moderate, 76-85 expensive, 86-92 very expensive, 93-99 elite. */
export interface AttributeCostCurve {
  attributeKey: AttributeKey;
  /** Base cost per point (before tier multiplier). */
  baseCost: number;
  /** Global multiplier for this attribute (e.g. 1.2 = 20% more expensive). */
  attributeMultiplier: number;
  tiers: CostTier[];
}

/** Per-position+height body limits (wing/weight) from capsDropDowns. */
export interface BodyLimitsByPositionHeight {
  get(position: Position, heightInches: number): {
    wingMin: number;
    wingMax: number;
    weightMin: number;
    weightMax: number;
  } | null;
}

export interface BuilderRulesConfig {
  globalBodyLimits?: GlobalBodyLimits;
  positionBodyLimits: Record<Position, PositionBodyLimits>;
  /** When set, wingspan/weight per height come from here instead of wingspanOffset. */
  bodyLimitsByPositionHeight?: BodyLimitsByPositionHeight;
  wingspanRule: WingspanRule;
  attributeDefinitions: AttributeDefinition[];
  attributeGroups: AttributeGroup[];
  baseAttributeCapsByPosition: Partial<
    Record<Position, Partial<Record<AttributeKey, number>>>
  >;
  heightModifiers: Partial<
    Record<
      AttributeKey,
      { perInchAbove: number; perInchBelow: number; reference: number }
    >
  >;
  wingspanModifiers: Partial<
    Record<
      AttributeKey,
      { perInchAbove: number; perInchBelow: number; referenceOffset: number }
    >
  >;
  weightModifiers: Partial<
    Record<
      AttributeKey,
      { perPoundAbove: number; perPoundBelow: number; reference: number }
    >
  >;
  attributeDependencyRules: AttributeDependencyRule[];
  attributeCostCurves: AttributeCostCurve[];
  overallWeights: OverallWeights;
  overallNormalization: OverallNormalizationRules;
  badges: BadgeDefinition[];
  archetypeRules: ArchetypeRule[];
  maxPoints: number;
  /** Target overall when build is "complete" (used for normalization). */
  targetOverall?: number;
}

