/**
 * Loads guideline JSON files and exposes normalized data for the builder.
 */

import type { BadgeDefinition, BadgeThreshold } from "@/types/builder";
import {
  buildBadgesFromJson,
  buildBodyLimitsFromJson,
  type RawBadgeTierRow,
  type RawBadgeUnlock,
  type RawCapsRow,
} from "./jsonLoader";

import badgeReq from "../../json/badge-requirements.json";
import myplayerBuilder from "../../json/myplayer-builder.json";

const badgeUnlocks: RawBadgeUnlock[] =
  (badgeReq as { pageProps?: { badgeUnlocks?: RawBadgeUnlock[] } })
    ?.pageProps?.badgeUnlocks ?? [];
const badgeTiers: RawBadgeTierRow[] =
  (myplayerBuilder as {
    pageProps?: { badgeTiers?: RawBadgeTierRow[]; capsDropDowns?: RawCapsRow[] };
  })?.pageProps?.badgeTiers ?? [];
const capsDropDowns: RawCapsRow[] =
  (myplayerBuilder as {
    pageProps?: { badgeTiers?: RawBadgeTierRow[]; capsDropDowns?: RawCapsRow[] };
  })?.pageProps?.capsDropDowns ?? [];

/** Badge definitions built from guideline JSON */
export function getBadgeDefinitionsFromJson(): BadgeDefinition[] {
  const built = buildBadgesFromJson(badgeUnlocks, badgeTiers);
  return built.map((b) => ({
    id: b.id,
    name: b.name,
    description: `${b.name} – from guideline data.`,
    category: b.category,
    thresholds: b.thresholds as BadgeThreshold[],
    heightMinInches: b.heightMinInches,
    heightMaxInches: b.heightMaxInches,
    maxTierByHeight: b.maxTierByHeight,
  }));
}

/** Body limits built from guideline JSON - lookup by position+height */
export function getBodyLimitsFromJson(): Map<
  string,
  { wingMin: number; wingMax: number; weightMin: number; weightMax: number }
> {
  const rows = buildBodyLimitsFromJson(capsDropDowns);
  const map = new Map<
    string,
    { wingMin: number; wingMax: number; weightMin: number; weightMax: number }
  >();
  for (const r of rows) {
    map.set(`${r.position}-${r.heightInches}`, {
      wingMin: r.wingMin,
      wingMax: r.wingMax,
      weightMin: r.weightMin,
      weightMax: r.weightMax,
    });
  }
  return map;
}

/** Position height ranges and weight ranges from capsDropDowns */
export function getPositionBodyRangesFromJson(): Map<
  string,
  { heightMin: number; heightMax: number; weightMin: number; weightMax: number }
> {
  const rows = buildBodyLimitsFromJson(capsDropDowns);
  const byPos = new Map<
    string,
    {
      heightMin: number;
      heightMax: number;
      weightMin: number;
      weightMax: number;
    }
  >();
  for (const r of rows) {
    const existing = byPos.get(r.position);
    if (!existing) {
      byPos.set(r.position, {
        heightMin: r.heightInches,
        heightMax: r.heightInches,
        weightMin: r.weightMin,
        weightMax: r.weightMax,
      });
    } else {
      byPos.set(r.position, {
        heightMin: Math.min(existing.heightMin, r.heightInches),
        heightMax: Math.max(existing.heightMax, r.heightInches),
        weightMin: Math.min(existing.weightMin, r.weightMin),
        weightMax: Math.max(existing.weightMax, r.weightMax),
      });
    }
  }
  return byPos;
}
