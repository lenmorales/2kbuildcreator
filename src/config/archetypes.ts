import { ArchetypeRule } from "@/types/builder";

export const archetypeRules: ArchetypeRule[] = [
  {
    id: "three-level-shot-creator",
    name: "3-Level Shot Creator",
    description: "Elite off-the-dribble scoring from deep, mid, and at the rim.",
    emphasize: {
      shooting: 1.2,
      finishing: 0.9,
      playmaking: 0.9
    },
    minOverall: 80
  },
  {
    id: "slashing-playmaker",
    name: "Slashing Playmaker",
    emphasize: {
      finishing: 1.2,
      playmaking: 1.1,
      physical: 1.0
    },
    minOverall: 78
  },
  {
    id: "defensive-anchor",
    name: "Defensive Anchor",
    emphasize: {
      defense: 1.3,
      physical: 1.0
    },
    minOverall: 78
  },
  {
    id: "two-way-inside-out-threat",
    name: "Two-Way Inside-Out Threat",
    emphasize: {
      defense: 1.1,
      shooting: 1.0,
      finishing: 1.0
    },
    minOverall: 82
  }
];

