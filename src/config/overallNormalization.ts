import { OverallNormalizationRules } from "@/types/builder";

/**
 * Normalization rules:
 * - minOverall is shown for minimum attribute state
 * - maxOverall is shown when a build is fully completed
 */
export const overallNormalizationRules: OverallNormalizationRules = {
  minOverall: 60,
  maxOverall: 99,
  completionBudgetRatio: 0.84
};
