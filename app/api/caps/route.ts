/**
 * API route for caps lookup - loads caps-output.json server-side only.
 * Avoids bundling the 3.3MB JSON in the client.
 */

import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

interface CapsOutputEntry {
  position: string;
  height: number;
  weight: number;
  wingspan: number;
  data: {
    results: Array<Record<string, number>>;
  };
}

const POSITION_MAP: Record<string, string> = {
  "Point Guard": "PG",
  "Shooting Guard": "SG",
  "Small Forward": "SF",
  "Power Forward": "PF",
  Center: "C",
};

const SNAKE_TO_CAMEL: Record<string, string> = {
  close_shot: "closeShot",
  driving_layup: "drivingLayup",
  driving_dunk: "drivingDunk",
  standing_dunk: "standingDunk",
  post_control: "postControl",
  mid_range_shot: "midRange",
  three_point_shot: "threePoint",
  free_throw: "freeThrow",
  pass_accuracy: "passAccuracy",
  ball_handle: "ballHandle",
  speed_with_ball: "speedWithBall",
  interior_defense: "interiorDefense",
  perimeter_defense: "perimeterDefense",
  steal: "steal",
  block: "block",
  offensive_rebound: "offensiveRebound",
  defensive_rebound: "defensiveRebound",
  speed: "speed",
  strength: "strength",
  vertical: "vertical",
  agility: "acceleration",
};

let capsMap: Map<string, Record<string, number>> | null = null;

async function loadCaps() {
  if (capsMap) return;
  const jsonPath = join(process.cwd(), "json", "caps-output.json");
  const raw = JSON.parse(await readFile(jsonPath, "utf-8")) as CapsOutputEntry[];
  const map = new Map<string, Record<string, number>>();

  for (const entry of raw) {
    const pos = POSITION_MAP[entry.position];
    if (!pos) continue;
    const result = entry.data?.results?.[0];
    if (!result) continue;

    const caps: Record<string, number> = {};
    for (const [snake, camel] of Object.entries(SNAKE_TO_CAMEL)) {
      const val = result[snake];
      if (typeof val === "number") caps[camel] = val;
    }

    const key = `${pos}-${entry.height}-${entry.weight}-${entry.wingspan}`;
    map.set(key, caps);
  }
  capsMap = map;
}

function lookupCaps(position: string, height: number, weight: number, wingspan: number): Record<string, number> | null {
  if (!capsMap) return null;
  const exactKey = `${position}-${height}-${weight}-${wingspan}`;
  return capsMap.get(exactKey) ?? null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const position = searchParams.get("position");
  const height = searchParams.get("height");
  const weight = searchParams.get("weight");
  const wingspan = searchParams.get("wingspan");

  if (!position || !height || !weight || !wingspan) {
    return NextResponse.json({ error: "Missing position, height, weight, or wingspan" }, { status: 400 });
  }

  await loadCaps();
  const caps = lookupCaps(position, parseInt(height, 10), parseInt(weight, 10), parseInt(wingspan, 10));
  if (!caps) {
    return NextResponse.json(
      {
        error: "No caps found for exact combination",
        combination: { position, height, weight, wingspan }
      },
      { status: 404 }
    );
  }
  return NextResponse.json(caps);
}
