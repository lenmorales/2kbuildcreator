import {
  PositionBodyLimits,
  Position,
  WingspanRule,
  GlobalBodyLimits,
  BodyLimitsByPositionHeight,
} from "@/types/builder";
import {
  getBodyLimitsFromJson,
  getPositionBodyRangesFromJson,
} from "@/data/guidelineData";

// Global limits: 5'9" = 69", 7'4" = 88"
export const GLOBAL_HEIGHT_MIN_INCHES = 69;
export const GLOBAL_HEIGHT_MAX_INCHES = 88;

export const globalBodyLimits: GlobalBodyLimits = {
  height: { minInches: GLOBAL_HEIGHT_MIN_INCHES, maxInches: GLOBAL_HEIGHT_MAX_INCHES },
};

const bodyLimitsMap = getBodyLimitsFromJson();
const positionRanges = getPositionBodyRangesFromJson();

/** Lookup wingspan/weight for a given position+height from capsDropDowns */
export const bodyLimitsByPositionHeight: BodyLimitsByPositionHeight = {
  get(position: Position, heightInches: number) {
    return bodyLimitsMap.get(`${position}-${heightInches}`) ?? null;
  },
};

// Fallback limits when JSON has no data for a position
const FALLBACK_LIMITS: Record<Position, PositionBodyLimits> = {
  PG: { position: "PG", height: { min: 69, max: 77 }, weight: { min: 160, max: 210 } },
  SG: { position: "SG", height: { min: 72, max: 79 }, weight: { min: 170, max: 225 } },
  SF: { position: "SF", height: { min: 75, max: 82 }, weight: { min: 195, max: 250 } },
  PF: { position: "PF", height: { min: 78, max: 85 }, weight: { min: 215, max: 275 } },
  C: { position: "C", height: { min: 80, max: 88 }, weight: { min: 235, max: 290 } },
};

const positionBodyLimitsRaw: Record<Position, PositionBodyLimits> = {
  ...FALLBACK_LIMITS,
};

for (const pos of ["PG", "SG", "SF", "PF", "C"] as Position[]) {
  const ranges = positionRanges.get(pos);
  if (ranges) {
    positionBodyLimitsRaw[pos] = {
      position: pos,
      height: { min: ranges.heightMin, max: ranges.heightMax },
      weight: { min: ranges.weightMin, max: ranges.weightMax },
    };
  }
}

export const positionBodyLimits: Record<Position, PositionBodyLimits> =
  positionBodyLimitsRaw;

// Fallback when bodyLimitsByPositionHeight has no row for a given height
export const wingspanRule: WingspanRule = {
  minOffset: -5,
  maxOffset: 8,
};
