import {
  AttributeDefinition,
  AttributeGroup,
  AttributeKey,
  AttributeCategory
} from "@/types/builder";

const define = (
  key: AttributeKey,
  label: string,
  category: AttributeCategory
): AttributeDefinition => ({
  key,
  label,
  category,
  min: 25,
  max: 99,
  step: 1
});

export const attributeDefinitions: AttributeDefinition[] = [
  // Finishing
  define("closeShot", "Close Shot", "finishing"),
  define("drivingLayup", "Driving Layup", "finishing"),
  define("drivingDunk", "Driving Dunk", "finishing"),
  define("standingDunk", "Standing Dunk", "finishing"),
  define("postControl", "Post Control", "finishing"),
  // Shooting
  define("midRange", "Mid-Range Shot", "shooting"),
  define("threePoint", "Three-Point Shot", "shooting"),
  define("freeThrow", "Free Throw", "shooting"),
  // Playmaking
  define("passAccuracy", "Pass Accuracy", "playmaking"),
  define("ballHandle", "Ball Handle", "playmaking"),
  define("speedWithBall", "Speed With Ball", "playmaking"),
  // Defense / Rebounding
  define("interiorDefense", "Interior Defense", "defense"),
  define("perimeterDefense", "Perimeter Defense", "defense"),
  define("steal", "Steal", "defense"),
  define("block", "Block", "defense"),
  define("offensiveRebound", "Offensive Rebound", "defense"),
  define("defensiveRebound", "Defensive Rebound", "defense"),
  // Physicals
  define("speed", "Speed", "physical"),
  define("acceleration", "Agility / Acceleration", "physical"),
  define("strength", "Strength", "physical"),
  define("vertical", "Vertical", "physical")
];

export const attributeGroups: AttributeGroup[] = [
  {
    id: "finishing",
    label: "Finishing",
    attributeKeys: [
      "closeShot",
      "drivingLayup",
      "drivingDunk",
      "standingDunk",
      "postControl"
    ]
  },
  {
    id: "shooting",
    label: "Shooting",
    attributeKeys: ["midRange", "threePoint", "freeThrow"]
  },
  {
    id: "playmaking",
    label: "Playmaking",
    attributeKeys: ["passAccuracy", "ballHandle", "speedWithBall"]
  },
  {
    id: "defense",
    label: "Defense / Rebounding",
    attributeKeys: [
      "interiorDefense",
      "perimeterDefense",
      "steal",
      "block",
      "offensiveRebound",
      "defensiveRebound"
    ]
  },
  {
    id: "physical",
    label: "Physicals",
    attributeKeys: ["speed", "acceleration", "strength", "vertical"]
  }
];

