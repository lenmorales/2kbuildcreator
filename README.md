## Elite Builder Lab

Elite Builder Lab is a configurable basketball player-builder inspired by modern pro-hoops builders. It is **not** affiliated with or endorsed by the NBA or 2K, and it does **not** claim to use any verified internal NBA 2K formula.

The app is intentionally built as a realistic, editable **2K-style system**.

## Core principles

- **Body-based caps are the source of truth**: position + height + weight + wingspan determine legal attribute caps.
- **Weighted value economy**: different attributes and rating ranges cost different amounts.
- **Weighted overall potential**: overall is position-weighted and normalized by legal body caps.
- **Completion rule**: a completed legal build reaches `99` overall with `0` value left.
- **Not all attributes reach 99**: many attributes correctly cap below 99 based on body/position rules. The build can still complete at 99 overall within those legal caps.
- **Tradeoff-first budget**: spendable budget is intentionally lower than full legal cap sum, so maxing one area requires sacrificing others.

## Cap system (preserved)

- Body limits and legal body combinations are defined in `src/config/bodyLimits.ts`.
- Exact body-valid caps come from `json/caps-output.json` through `app/api/caps/route.ts`.
- The client never weakens that cap source with a generic model.
- If body settings lower an attribute cap, current values are auto-clamped to stay legal.

## Weighted attribute costs

Cost curves are configured in `src/config/attributeCosts.ts`.

- Each attribute has:
  - `baseCost`
  - `attributeMultiplier`
  - tier multipliers
- Tier bands are configurable (default style):
  - `25–60`: low
  - `61–75`: moderate
  - `76–85`: expensive
  - `86–92`: very expensive
  - `93–99`: premium

Examples:

- `Free Throw` can be tuned cheaper than `Three-Point Shot`.
- Elite playmaking/perimeter tools can be tuned to get very expensive in upper tiers.

## Overall calculation and normalization

Overall logic is implemented in `src/utils/rulesEngine.ts` and configured by:

- `src/config/overall.ts` for **attribute contribution weights by position**
- `src/config/overallNormalization.ts` for `minOverall` / `maxOverall`

Calculation model:

1. Compute weighted attribute score for the current values.
2. Compute weighted score at minimum values and at body-valid caps.
3. Normalize progression between min and cap-weighted score.
4. Combine that with value-economy progression (spent vs total legal capacity).
5. Clamp to configured overall bounds.

This ensures `99` only occurs at completed legal progression, and completed progression consumes the full legal value budget.

Important: normalization is done against each build's **actual legal capped potential**, not a hypothetical all-99 profile.
The engine targets the best weighted score achievable under that build budget, so 99 represents an optimized completed build rather than maxing every capped attribute.

## Where to tune the system

- Body limits and body ranges: `src/config/bodyLimits.ts`
- Body-valid caps source/API: `app/api/caps/route.ts` + `json/caps-output.json`
- Attribute definitions/groups: `src/config/attributes.ts`
- Cost curves: `src/config/attributeCosts.ts`
- Overall weights by position: `src/config/overall.ts`
- Overall normalization bounds: `src/config/overallNormalization.ts`
- Dependency rules: `src/config/attributeDependencies.ts`
- Badges and thresholds: JSON guideline loaders + `src/data/jsonLoader.ts`
- Engine math: `src/utils/rulesEngine.ts`

## Notes

- This project is a configurable simulation framework, not a verified exact game formula.
- UI reads from config + rules engine so balancing changes are data-driven.
