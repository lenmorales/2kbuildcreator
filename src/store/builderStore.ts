import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  AttributeCaps,
  AttributeValues,
  BodySettings,
  Position
} from "@/types/builder";
import {
  RULES,
  applyDependenciesAndCaps,
  clampBodySettings,
  computeBuildBudget,
  computeCompletionProgress,
  computeAllBadges,
  computeAttributeCaps,
  computeOverallRating,
  computeRemainingPoints,
  computeRemainingPointsRaw,
  createDefaultAttributes,
  getPositionBodyLimits,
  getWingspanRangeForHeight
} from "@/utils/rulesEngine";
import { fetchCapsFromApi } from "@/data/capsLookup";

export interface BuilderState {
  body: BodySettings;
  attributes: AttributeValues;
  caps: AttributeCaps;
  remainingPoints: number;
  totalValueCapacity: number;
  completionProgress: number;
  overall: number;
  badgeTiers: Record<string, string>;
  lastAutoClampedFields: (keyof BodySettings)[];
  lastRaisedByDependency: (keyof AttributeValues)[];
  lastClampedByCap: (keyof AttributeValues)[];

  setPosition(position: Position): Promise<void>;
  setBody<K extends keyof BodySettings>(
    key: K,
    value: BodySettings[K]
  ): Promise<void>;
  refreshCaps(): Promise<void>;
  setAttribute<K extends keyof AttributeValues>(
    key: K,
    value: AttributeValues[K]
  ): void;
  reset(): Promise<void>;
}

function getDefaultBody(): BodySettings {
  const limits = getPositionBodyLimits("PG");
  const height = limits.height.min;
  const wingspanRange = getWingspanRangeForHeight(height, "PG");
  return {
    position: "PG",
    height,
    weight: limits.weight.min,
    wingspan: wingspanRange.min
  };
}

function deriveState(
  body: BodySettings,
  attributes: AttributeValues,
  capsOverride?: AttributeCaps
): Pick<
  BuilderState,
  | "caps"
  | "remainingPoints"
  | "totalValueCapacity"
  | "completionProgress"
  | "overall"
  | "badgeTiers"
  | "lastRaisedByDependency"
  | "lastClampedByCap"
> & { attributes: AttributeValues } {
  const caps = capsOverride ?? computeAttributeCaps(body);
  const {
    values,
    raisedByDependency,
    clampedByCap
  } = applyDependenciesAndCaps(attributes, caps);
  const totalValueCapacity = computeBuildBudget(caps, body);
  const remainingPoints = computeRemainingPoints(values, caps, body);
  const completionProgress = computeCompletionProgress(values, caps, body);
  const overall = computeOverallRating(body.position, values, caps, body);
  const badgeTiers = computeAllBadges(values, body);
  return {
    attributes: values,
    caps,
    remainingPoints,
    totalValueCapacity,
    completionProgress,
    overall,
    badgeTiers,
    lastRaisedByDependency: raisedByDependency,
    lastClampedByCap: clampedByCap
  };
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => {
      const defaultBody = getDefaultBody();
      const { clamped: clampedBody } = clampBodySettings(defaultBody);
      const initialAttributes = createDefaultAttributes();
      const derived = deriveState(clampedBody, initialAttributes);

      return {
        body: clampedBody,
        attributes: derived.attributes,
        caps: derived.caps,
        remainingPoints: derived.remainingPoints,
        totalValueCapacity: derived.totalValueCapacity,
        completionProgress: derived.completionProgress,
        overall: derived.overall,
        badgeTiers: derived.badgeTiers,
        lastAutoClampedFields: [],
        lastRaisedByDependency: [],
        lastClampedByCap: [],

        async setPosition(position) {
          const current = get();
          const nextBody = { ...current.body, position };
          const { clamped, clampedFields } = clampBodySettings(nextBody);
          try {
            const caps = await fetchCapsFromApi(clamped);
            const derivedNext = deriveState(clamped, current.attributes, caps);
            set({
              body: clamped,
              attributes: derivedNext.attributes,
              caps: derivedNext.caps,
              remainingPoints: derivedNext.remainingPoints,
              totalValueCapacity: derivedNext.totalValueCapacity,
              completionProgress: derivedNext.completionProgress,
              overall: derivedNext.overall,
              badgeTiers: derivedNext.badgeTiers,
              lastAutoClampedFields: clampedFields,
              lastRaisedByDependency: derivedNext.lastRaisedByDependency,
              lastClampedByCap: derivedNext.lastClampedByCap
            });
          } catch (error) {
            console.error("Failed to fetch body-valid caps for setPosition:", error);
          }
        },

        async setBody(key, value) {
          const current = get();
          const nextBody = { ...current.body, [key]: value };
          const { clamped, clampedFields } = clampBodySettings(nextBody);
          try {
            const caps = await fetchCapsFromApi(clamped);
            const derivedNext = deriveState(clamped, current.attributes, caps);
            set({
              body: clamped,
              attributes: derivedNext.attributes,
              caps: derivedNext.caps,
              remainingPoints: derivedNext.remainingPoints,
              totalValueCapacity: derivedNext.totalValueCapacity,
              completionProgress: derivedNext.completionProgress,
              overall: derivedNext.overall,
              badgeTiers: derivedNext.badgeTiers,
              lastAutoClampedFields: clampedFields,
              lastRaisedByDependency: derivedNext.lastRaisedByDependency,
              lastClampedByCap: derivedNext.lastClampedByCap
            });
          } catch (error) {
            console.error("Failed to fetch body-valid caps for setBody:", error);
          }
        },

        async refreshCaps() {
          const current = get();
          try {
            const caps = await fetchCapsFromApi(current.body);
            const derivedNext = deriveState(current.body, current.attributes, caps);
            set({
              attributes: derivedNext.attributes,
              caps: derivedNext.caps,
              remainingPoints: derivedNext.remainingPoints,
              totalValueCapacity: derivedNext.totalValueCapacity,
              completionProgress: derivedNext.completionProgress,
              overall: derivedNext.overall,
              badgeTiers: derivedNext.badgeTiers,
              lastRaisedByDependency: derivedNext.lastRaisedByDependency,
              lastClampedByCap: derivedNext.lastClampedByCap
            });
          } catch (error) {
            console.error("Failed to refresh body-valid caps:", error);
          }
        },

        setAttribute(key, value) {
          const current = get();
          const cap = current.caps[key];
          const min = RULES.attributeDefinitions.find((d) => d.key === key)!.min;
          let clampedValue = Math.max(min, Math.min(cap, value));
          let nextAttributes = { ...current.attributes, [key]: clampedValue };
          // Prevent overspending: clamp to the highest affordable value.
          while (
            clampedValue > min &&
            computeRemainingPointsRaw(nextAttributes, current.caps, current.body) < 0
          ) {
            clampedValue -= 1;
            nextAttributes = { ...current.attributes, [key]: clampedValue };
          }
          const derivedNext = deriveState(current.body, nextAttributes, current.caps);
          set({
            attributes: derivedNext.attributes,
            caps: derivedNext.caps,
            remainingPoints: derivedNext.remainingPoints,
            totalValueCapacity: derivedNext.totalValueCapacity,
            completionProgress: derivedNext.completionProgress,
            overall: derivedNext.overall,
            badgeTiers: derivedNext.badgeTiers,
            lastAutoClampedFields: [],
            lastRaisedByDependency: derivedNext.lastRaisedByDependency,
            lastClampedByCap: derivedNext.lastClampedByCap
          });
        },

        async reset() {
          const attrs = createDefaultAttributes();
          const { clamped } = clampBodySettings(getDefaultBody());
          try {
            const caps = await fetchCapsFromApi(clamped);
            const derivedNext = deriveState(clamped, attrs, caps);
            set({
              body: clamped,
              attributes: derivedNext.attributes,
              caps: derivedNext.caps,
              remainingPoints: derivedNext.remainingPoints,
              totalValueCapacity: derivedNext.totalValueCapacity,
              completionProgress: derivedNext.completionProgress,
              overall: derivedNext.overall,
              badgeTiers: derivedNext.badgeTiers,
              lastAutoClampedFields: [],
              lastRaisedByDependency: [],
              lastClampedByCap: []
            });
          } catch (error) {
            console.error("Failed to fetch body-valid caps for reset:", error);
          }
        }
      };
    },
    {
      name: "elite-builder-lab",
      partialize(state) {
        return { body: state.body, attributes: state.attributes };
      }
    }
  )
);
