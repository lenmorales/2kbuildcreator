/**
 * Loads and normalizes data from the JSON guideline files.
 * Attribute names, positions, and height strings are mapped to our internal format.
 */

import type { AttributeKey, BadgeTier, Position } from "@/types/builder";

// Raw JSON types from the guideline files
export interface RawBadgeUnlock {
  Category: string;
  Badge: string;
  Type: string;
  Attribute: string;
  Bronze: number;
  Silver: number;
  Gold: number;
  HoF: number;
  Legend: number | "";
  Min_Height: string;
  Max_Height: string;
  id: string;
}

export interface RawCapsRow {
  height: string;
  wingMax: string;
  wingMin: string;
  position: string;
  weightMax: string;
  weightMin: string;
}

export interface RawBadgeTierRow {
  badge: string;
  five_nine: number | "";
  five_ten: number | "";
  five_eleven: number | "";
  six: number | "";
  six_one: number | "";
  six_two: number | "";
  six_three: number | "";
  six_four: number | "";
  six_five: number | "";
  six_six: number | "";
  six_seven: number | "";
  six_eight: number | "";
  six_nine: number | "";
  six_ten: number | "";
  six_eleven: number | "";
  seven: number | "";
  seven_one: number | "";
  seven_two: number | "";
  seven_three: number | "";
  category: string;
}

// Attribute name mapping: JSON Attribute -> our AttributeKey
const ATTR_MAP: Record<string, AttributeKey> = {
  "Driving Dunk": "drivingDunk",
  "Standing Dunk": "standingDunk",
  "Close Shot": "closeShot",
  Layup: "drivingLayup",
  "Post Control": "postControl",
  "Mid-Range Shot": "midRange",
  "Three-Point Shot": "threePoint",
  Strength: "strength",
  Vertical: "vertical",
  "Offensive Rebound": "offensiveRebound",
  "Defensive Rebound": "defensiveRebound",
  "Pass Accuracy": "passAccuracy",
  "Ball Handle": "ballHandle",
  "Speed With Ball": "speedWithBall",
  Agility: "acceleration",
  "Perimeter Defense": "perimeterDefense",
  "Interior Defense": "interiorDefense",
  Steal: "steal",
  Block: "block",
  Speed: "speed",
};

// Position mapping
const POSITION_MAP: Record<string, Position> = {
  "Point Guard": "PG",
  "Shooting Guard": "SG",
  "Small Forward": "SF",
  "Power Forward": "PF",
  Center: "C",
};

// Height string to inches: "5'9" -> 69, "7'4" -> 88
export function parseHeightToInches(s: string): number {
  const match = s.match(/^(\d+)'(\d+)"?$/);
  if (!match) return 69;
  const feet = parseInt(match[1], 10);
  const inches = parseInt(match[2], 10);
  return feet * 12 + inches;
}

// Height key for badge tier lookup: 69 -> "five_nine" (69=5'9), 70->five_ten, etc.
const HEIGHT_KEYS: Record<number, keyof RawBadgeTierRow> = {
  69: "five_nine",
  70: "five_ten",
  71: "five_eleven",
  72: "six",
  73: "six_one",
  74: "six_two",
  75: "six_three",
  76: "six_four",
  77: "six_five",
  78: "six_six",
  79: "six_seven",
  80: "six_eight",
  81: "six_nine",
  82: "six_ten",
  83: "six_eleven",
  84: "seven",
  85: "seven_one",
  86: "seven_two",
  87: "seven_three",
};

// Badge category mapping
const BADGE_CAT_MAP: Record<string, "finishing" | "shooting" | "playmaking" | "defense" | "general"> = {
  "Inside Scoring": "finishing",
  "Outside Scoring": "shooting",
  Playmaking: "playmaking",
  Defense: "defense",
  Rebounding: "defense",
  "General Offense": "shooting",
  "All Around": "general",
  Finishing: "finishing",
  Shooting: "shooting",
  General: "general",
};

const TIER_ORDER: Exclude<BadgeTier, "none">[] = [
  "bronze",
  "silver",
  "gold",
  "hallOfFame",
  "legend",
];

function getTierThreshold(
  row: RawBadgeUnlock,
  tier: Exclude<BadgeTier, "none">
): number {
  const key =
    tier === "hallOfFame" ? "HoF" : tier === "legend" ? "Legend" : tier;
  const v = (row as unknown as Record<string, unknown>)[key];
  if (v === "" || v === undefined) return 999;
  return typeof v === "number" ? v : 999;
}

export function mapAttribute(attr: string): AttributeKey | null {
  return ATTR_MAP[attr] ?? null;
}

export function mapPosition(pos: string): Position | null {
  return POSITION_MAP[pos] ?? null;
}

/** Load badge unlocks and tier limits, build normalized badge definitions */
export function buildBadgesFromJson(
  badgeUnlocks: RawBadgeUnlock[],
  badgeTiers: RawBadgeTierRow[]
): {
  id: string;
  name: string;
  category: "finishing" | "shooting" | "playmaking" | "defense" | "general";
  thresholds: { tier: Exclude<BadgeTier, "none">; requirements: Partial<Record<AttributeKey, number>> }[];
  heightMinInches: number;
  heightMaxInches: number;
  maxTierByHeight: Record<number, number>;
}[] {
  const tierMap = new Map<string, RawBadgeTierRow>();
  for (const row of badgeTiers) {
    tierMap.set(row.badge, row);
  }

  const byBadge = new Map<
    string,
    {
      rows: RawBadgeUnlock[];
      category: string;
      heightMin: number;
      heightMax: number;
    }
  >();

  for (const row of badgeUnlocks) {
    const attr = mapAttribute(row.Attribute);
    if (!attr) continue;

    let entry = byBadge.get(row.id);
    if (!entry) {
      entry = {
        rows: [],
        category: row.Category,
        heightMin: parseHeightToInches(row.Min_Height),
        heightMax: parseHeightToInches(row.Max_Height),
      };
      byBadge.set(row.id, entry);
    }
    entry.rows.push(row);
  }

  const result: {
    id: string;
    name: string;
    category: "finishing" | "shooting" | "playmaking" | "defense" | "general";
    thresholds: { tier: Exclude<BadgeTier, "none">; requirements: Partial<Record<AttributeKey, number>> }[];
    heightMinInches: number;
    heightMaxInches: number;
    maxTierByHeight: Record<number, number>;
  }[] = [];

  const nameAliases: Record<string, string> = {
    "Phyiscal Finisher": "Physical Finisher",
  };

  for (const [id, entry] of byBadge) {
    const first = entry.rows[0];
    const name = first?.Badge ?? id;
    const tierRow = tierMap.get(nameAliases[name] ?? name);
    const category = BADGE_CAT_MAP[entry.category] ?? "defense";

    const thresholds: {
      tier: Exclude<BadgeTier, "none">;
      requirements: Partial<Record<AttributeKey, number>>;
    }[] = [];

    for (const tier of TIER_ORDER) {
      const req: Partial<Record<AttributeKey, number>> = {};
      let allValid = true;
      for (const row of entry.rows) {
        const key = mapAttribute(row.Attribute);
        if (!key) continue;
        const thresh = getTierThreshold(row, tier);
        if (thresh >= 999) {
          allValid = false;
          break;
        }
        req[key] = thresh;
      }
      if (allValid && Object.keys(req).length > 0) {
        thresholds.push({ tier, requirements: req });
      }
    }

    const maxTierByHeight: Record<number, number> = {};
    if (tierRow) {
      for (const [inches, key] of Object.entries(HEIGHT_KEYS)) {
        const inchNum = parseInt(inches, 10);
        const val = tierRow[key];
        if (val === "" || val === undefined) continue;
        const n = typeof val === "number" ? val : parseInt(String(val), 10);
        if (!isNaN(n)) maxTierByHeight[inchNum] = n;
      }
    }

    result.push({
      id: id.replace(/\s+/g, ""),
      name,
      category,
      thresholds,
      heightMinInches: entry.heightMin,
      heightMaxInches: entry.heightMax,
      maxTierByHeight,
    });
  }

  return result;
}

/** Build body limits from capsDropDowns */
export function buildBodyLimitsFromJson(
  capsDropDowns: RawCapsRow[]
): {
  position: Position;
  heightInches: number;
  wingMin: number;
  wingMax: number;
  weightMin: number;
  weightMax: number;
}[] {
  const result: {
    position: Position;
    heightInches: number;
    wingMin: number;
    wingMax: number;
    weightMin: number;
    weightMax: number;
  }[] = [];

  for (const row of capsDropDowns) {
    const pos = mapPosition(row.position);
    if (!pos) continue;
    result.push({
      position: pos,
      heightInches: parseInt(row.height, 10) || 72,
      wingMin: parseInt(row.wingMin, 10) || 72,
      wingMax: parseInt(row.wingMax, 10) || 78,
      weightMin: parseInt(row.weightMin, 10) || 160,
      weightMax: parseInt(row.weightMax, 10) || 220,
    });
  }
  return result;
}
