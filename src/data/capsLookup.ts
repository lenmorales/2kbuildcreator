/**
 * Fetches caps from the API (caps-output.json is loaded server-side only).
 * Avoids bundling the 3.3MB JSON which causes webpack chunk errors.
 */

import type { AttributeCaps, BodySettings } from "@/types/builder";

/**
 * Fetch attribute caps from the API for the given body.
 * The API loads caps-output.json server-side and returns the exact caps.
 */
export async function fetchCapsFromApi(body: BodySettings): Promise<AttributeCaps> {
  const params = new URLSearchParams({
    position: body.position,
    height: String(body.height),
    weight: String(body.weight),
    wingspan: String(body.wingspan),
  });
  const res = await fetch(`/api/caps?${params}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch caps: ${res.status}`);
  }
  return res.json() as Promise<AttributeCaps>;
}
