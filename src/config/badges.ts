import { BadgeDefinition } from "@/types/builder";

/**
 * Badge catalog: 2K-style categories with tiered unlocks (None → Bronze → Silver → Gold → HOF → Legend).
 * Thresholds are configurable; exact official formulas are not public.
 */
export const badgeDefinitions: BadgeDefinition[] = [
  // --- Finishing ---
  {
    id: "acrobat",
    name: "Acrobat",
    description: "Improved layup success on acrobatic and change-shot attempts.",
    category: "finishing",
    thresholds: [
      { tier: "bronze", requirements: { drivingLayup: 70, closeShot: 60 } },
      { tier: "silver", requirements: { drivingLayup: 78, closeShot: 68 } },
      { tier: "gold", requirements: { drivingLayup: 86, closeShot: 76 } },
      { tier: "hallOfFame", requirements: { drivingLayup: 93, closeShot: 84 } },
      { tier: "legend", requirements: { drivingLayup: 97, closeShot: 90 } }
    ]
  },
  {
    id: "posterizer",
    name: "Posterizer",
    description: "Improved dunk success when attacking the rim in traffic.",
    category: "finishing",
    thresholds: [
      { tier: "bronze", requirements: { drivingDunk: 75, vertical: 70 } },
      { tier: "silver", requirements: { drivingDunk: 82, vertical: 75 } },
      { tier: "gold", requirements: { drivingDunk: 88, vertical: 80 } },
      { tier: "hallOfFame", requirements: { drivingDunk: 94, vertical: 85 } },
      { tier: "legend", requirements: { drivingDunk: 98, vertical: 90 } }
    ]
  },
  {
    id: "slithery",
    name: "Slithery",
    description: "Better success on layups through contact.",
    category: "finishing",
    thresholds: [
      { tier: "bronze", requirements: { drivingLayup: 72, closeShot: 65 } },
      { tier: "silver", requirements: { drivingLayup: 80, closeShot: 72 } },
      { tier: "gold", requirements: { drivingLayup: 88, closeShot: 80 } },
      { tier: "hallOfFame", requirements: { drivingLayup: 94, closeShot: 86 } },
      { tier: "legend", requirements: { drivingLayup: 98, closeShot: 91 } }
    ]
  },
  {
    id: "backdown-punisher",
    name: "Backdown Punisher",
    description: "Improved effectiveness when backing down defenders in the post.",
    category: "finishing",
    thresholds: [
      { tier: "bronze", requirements: { postControl: 70, strength: 65 } },
      { tier: "silver", requirements: { postControl: 78, strength: 72 } },
      { tier: "gold", requirements: { postControl: 85, strength: 80 } },
      { tier: "hallOfFame", requirements: { postControl: 92, strength: 86 } },
      { tier: "legend", requirements: { postControl: 97, strength: 91 } }
    ]
  },
  {
    id: "rise-up",
    name: "Rise Up",
    description: "Improved standing dunk success and ability to finish through contact at the rim.",
    category: "finishing",
    thresholds: [
      { tier: "bronze", requirements: { standingDunk: 70, vertical: 65 } },
      { tier: "silver", requirements: { standingDunk: 78, vertical: 72 } },
      { tier: "gold", requirements: { standingDunk: 86, vertical: 80 } },
      { tier: "hallOfFame", requirements: { standingDunk: 93, vertical: 86 } },
      { tier: "legend", requirements: { standingDunk: 98, vertical: 91 } }
    ]
  },
  // --- Shooting ---
  {
    id: "limitless-range",
    name: "Limitless Range",
    description: "Extended three-point shooting range off the dribble and catch.",
    category: "shooting",
    thresholds: [
      { tier: "bronze", requirements: { threePoint: 78 } },
      { tier: "silver", requirements: { threePoint: 85 } },
      { tier: "gold", requirements: { threePoint: 92 } },
      { tier: "hallOfFame", requirements: { threePoint: 97 } },
      { tier: "legend", requirements: { threePoint: 99, midRange: 94 } }
    ]
  },
  {
    id: "catch-and-shoot",
    name: "Catch and Shoot",
    description: "Improved shot success when shooting immediately after a catch.",
    category: "shooting",
    thresholds: [
      { tier: "bronze", requirements: { threePoint: 70, midRange: 68 } },
      { tier: "silver", requirements: { threePoint: 78, midRange: 75 } },
      { tier: "gold", requirements: { threePoint: 86, midRange: 82 } },
      { tier: "hallOfFame", requirements: { threePoint: 92, midRange: 88 } },
      { tier: "legend", requirements: { threePoint: 97, midRange: 93 } }
    ]
  },
  {
    id: "deadeye",
    name: "Deadeye",
    description: "Reduced shot contest penalty on mid-range and three-point attempts.",
    category: "shooting",
    thresholds: [
      { tier: "bronze", requirements: { midRange: 72, threePoint: 70 } },
      { tier: "silver", requirements: { midRange: 80, threePoint: 78 } },
      { tier: "gold", requirements: { midRange: 87, threePoint: 85 } },
      { tier: "hallOfFame", requirements: { midRange: 93, threePoint: 91 } },
      { tier: "legend", requirements: { midRange: 97, threePoint: 96 } }
    ]
  },
  {
    id: "slippery-off-ball",
    name: "Slippery Off-Ball",
    description: "Easier to get open off screens and cuts for catch-and-shoot opportunities.",
    category: "shooting",
    thresholds: [
      { tier: "bronze", requirements: { speed: 70, acceleration: 68 } },
      { tier: "silver", requirements: { speed: 78, acceleration: 75 } },
      { tier: "gold", requirements: { speed: 85, acceleration: 82 } },
      { tier: "hallOfFame", requirements: { speed: 91, acceleration: 88 } },
      { tier: "legend", requirements: { speed: 96, acceleration: 93 } }
    ]
  },
  {
    id: "clutch-shooter",
    name: "Clutch Shooter",
    description: "Improved shot success in clutch situations (late game).",
    category: "shooting",
    thresholds: [
      { tier: "bronze", requirements: { threePoint: 72, midRange: 72, freeThrow: 75 } },
      { tier: "silver", requirements: { threePoint: 80, midRange: 80, freeThrow: 82 } },
      { tier: "gold", requirements: { threePoint: 87, midRange: 87, freeThrow: 88 } },
      { tier: "hallOfFame", requirements: { threePoint: 93, midRange: 93, freeThrow: 93 } },
      { tier: "legend", requirements: { threePoint: 98, midRange: 98, freeThrow: 97 } }
    ]
  },
  // --- Playmaking ---
  {
    id: "floor-general",
    name: "Floor General",
    description: "Teammates’ offensive consistency improves when you run the offense.",
    category: "playmaking",
    thresholds: [
      { tier: "bronze", requirements: { passAccuracy: 75, ballHandle: 74 } },
      { tier: "silver", requirements: { passAccuracy: 82, ballHandle: 80 } },
      { tier: "gold", requirements: { passAccuracy: 89, ballHandle: 86 } },
      { tier: "hallOfFame", requirements: { passAccuracy: 94, ballHandle: 91 } },
      { tier: "legend", requirements: { passAccuracy: 98, ballHandle: 95 } }
    ]
  },
  {
    id: "dimer",
    name: "Dimer",
    description: "Teammates hit shots at a higher rate after receiving your pass.",
    category: "playmaking",
    thresholds: [
      { tier: "bronze", requirements: { passAccuracy: 80 } },
      { tier: "silver", requirements: { passAccuracy: 86 } },
      { tier: "gold", requirements: { passAccuracy: 92 } },
      { tier: "hallOfFame", requirements: { passAccuracy: 96 } },
      { tier: "legend", requirements: { passAccuracy: 99, ballHandle: 92 } }
    ]
  },
  {
    id: "handles-for-days",
    name: "Handles for Days",
    description: "Reduced chance of being stripped while dribbling.",
    category: "playmaking",
    thresholds: [
      { tier: "bronze", requirements: { ballHandle: 78, speedWithBall: 75 } },
      { tier: "silver", requirements: { ballHandle: 85, speedWithBall: 82 } },
      { tier: "gold", requirements: { ballHandle: 91, speedWithBall: 88 } },
      { tier: "hallOfFame", requirements: { ballHandle: 95, speedWithBall: 92 } },
      { tier: "legend", requirements: { ballHandle: 98, speedWithBall: 95 } }
    ]
  },
  {
    id: "quick-first-step",
    name: "Quick First Step",
    description: "Faster burst when accelerating from a standstill with the ball.",
    category: "playmaking",
    thresholds: [
      { tier: "bronze", requirements: { acceleration: 72, speedWithBall: 70 } },
      { tier: "silver", requirements: { acceleration: 80, speedWithBall: 77 } },
      { tier: "gold", requirements: { acceleration: 87, speedWithBall: 84 } },
      { tier: "hallOfFame", requirements: { acceleration: 92, speedWithBall: 89 } },
      { tier: "legend", requirements: { acceleration: 96, speedWithBall: 93 } }
    ]
  },
  {
    id: "unpluckable",
    name: "Unpluckable",
    description: "Harder for defenders to steal the ball from you.",
    category: "playmaking",
    thresholds: [
      { tier: "bronze", requirements: { ballHandle: 73 } },
      { tier: "silver", requirements: { ballHandle: 80 } },
      { tier: "gold", requirements: { ballHandle: 86 } },
      { tier: "hallOfFame", requirements: { ballHandle: 92 } },
      { tier: "legend", requirements: { ballHandle: 97 } }
    ]
  },
  // --- Defense / Rebounding ---
  {
    id: "anchor",
    name: "Anchor",
    description: "Stronger interior defense and rim protection presence.",
    category: "defense",
    thresholds: [
      { tier: "bronze", requirements: { interiorDefense: 78, block: 76 } },
      { tier: "silver", requirements: { interiorDefense: 85, block: 83 } },
      { tier: "gold", requirements: { interiorDefense: 91, block: 89 } },
      { tier: "hallOfFame", requirements: { interiorDefense: 95, block: 93 } },
      { tier: "legend", requirements: { interiorDefense: 98, block: 97, defensiveRebound: 90 } }
    ]
  },
  {
    id: "menace",
    name: "Menace",
    description: "Stronger on-ball defense; more likely to force pickups and bad passes.",
    category: "defense",
    thresholds: [
      { tier: "bronze", requirements: { perimeterDefense: 74, steal: 70 } },
      { tier: "silver", requirements: { perimeterDefense: 81, steal: 77 } },
      { tier: "gold", requirements: { perimeterDefense: 87, steal: 83 } },
      { tier: "hallOfFame", requirements: { perimeterDefense: 92, steal: 88 } },
      { tier: "legend", requirements: { perimeterDefense: 96, steal: 93 } }
    ]
  },
  {
    id: "interceptor",
    name: "Interceptor",
    description: "Improved steal success on passing lanes and pick attempts.",
    category: "defense",
    thresholds: [
      { tier: "bronze", requirements: { steal: 72, perimeterDefense: 68 } },
      { tier: "silver", requirements: { steal: 80, perimeterDefense: 75 } },
      { tier: "gold", requirements: { steal: 86, perimeterDefense: 82 } },
      { tier: "hallOfFame", requirements: { steal: 91, perimeterDefense: 88 } },
      { tier: "legend", requirements: { steal: 96, perimeterDefense: 93 } }
    ]
  },
  {
    id: "chase-down-artist",
    name: "Chase Down Artist",
    description: "Improved block success when contesting from behind.",
    category: "defense",
    thresholds: [
      { tier: "bronze", requirements: { block: 72, speed: 70 } },
      { tier: "silver", requirements: { block: 79, speed: 76 } },
      { tier: "gold", requirements: { block: 85, speed: 82 } },
      { tier: "hallOfFame", requirements: { block: 90, speed: 87 } },
      { tier: "legend", requirements: { block: 95, speed: 92 } }
    ]
  },
  {
    id: "rebound-chaser",
    name: "Rebound Chaser",
    description: "Improved rebounding when pursuing the ball outside your immediate area.",
    category: "defense",
    thresholds: [
      { tier: "bronze", requirements: { defensiveRebound: 75, offensiveRebound: 72 } },
      { tier: "silver", requirements: { defensiveRebound: 83, offensiveRebound: 80 } },
      { tier: "gold", requirements: { defensiveRebound: 90, offensiveRebound: 87 } },
      { tier: "hallOfFame", requirements: { defensiveRebound: 95, offensiveRebound: 92 } },
      { tier: "legend", requirements: { defensiveRebound: 98, offensiveRebound: 96, strength: 88 } }
    ]
  }
];
