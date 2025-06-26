import * as fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { genPOIs } from "./pointOfInterest";
import roll from "./roll";
import { genNpc } from "./npc";
import { genStreet } from "./street";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __copyright = path.join(__dirname, "../copyright");
const __temp = path.join(__dirname, "../temp");

type d10ByWealth = {
  [key in Wealth]: string[];
};

interface DistrictContents {
  d10Issues: d10ByWealth;
  d10Features: d10ByWealth;
  features: { feature: string; description: string }[];
  issues: { issue: string; description: string }[];
}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

// feature, issues, street detail, Sparks (additional sparks from other sources), NPCs from Magical Industrial Revolution

function getPlacementGuide(numPOIs: number): POIPlacementGuide {
  function getPlacementInterface() {
    return [
      [2, 3],
      getRandomInt(0, 2) ? [1, 2, 3] : [2, 3, 4],
      [1, 2, 3, 4],
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4],
      getRandomInt(0, 2) ? [1, 2, 3] : [2, 3, 4],
      [2, 3],
    ];
  }

  const placementGuide = [
    [[], [], [], [], [], []],
    [[], [], [], [], [], []],
    [[], [], [], [], [], []],
    [[], [], [], [], [], []],
    [[], [], [], [], [], []],
    [[], [], [], [], [], []],
    [[], [], [], [], [], []],
  ];

  const placementInterface = getPlacementInterface();
  const POIs = Array.from(Array(numPOIs)).map((_, i) => i);
  while (POIs.length > 0) {
    const randomRowIndex = getRandomInt(0, 7);
    let interfaceRow = placementInterface[randomRowIndex];
    const randomAvailableIndex =
      interfaceRow[getRandomInt(0, interfaceRow.length)];
    if (
      typeof placementGuide[randomRowIndex][randomAvailableIndex][0] !==
      "number"
    ) {
      interfaceRow = interfaceRow.filter(
        (availableIndex) => availableIndex !== randomAvailableIndex,
      );
      placementGuide[randomRowIndex][randomAvailableIndex].push(
        POIs.shift() + 1,
      );
    }
  }

  return placementGuide;
}

const writeDistrictMd = async ({
  wealth,
  feature,
  issue,
  touchstone,
  street,
  npc,
  placementGuide,
  POIs,
}: District) => {
  try {
    const legiblePlacementGuide = placementGuide.reduce(
      (guideString: string, row) => {
        const rowString = row.reduce(
          (rowStr: string, cell) =>
            `${rowStr}${typeof cell[0] === "number" ? cell[0].toString().concat(" ") : "# "}`,
          "",
        );
        return `${guideString}\n    ${rowString}`;
      },
      "",
    );
    const keydLocations = Object.entries(POIs).reduce(
      (accString, [poiKey, { interaction, sparks, building }]) =>
        accString.concat(`
#### ${poiKey}
**${interaction}**
*(${sparks.join(", ")})*
${building.type}
${building.description}
`),
      "",
    );
    const content = `
## Wealth
${wealth}
## Feature
**${feature.feature}**
${feature.description}
## Issue
**${issue.issue}**
${issue.description}
## Touchstone
${touchstone}
## Street Detail
**${street.name}**
${street.description}
## Notable NPC
**${npc.name}**
- ${npc.appearance}
- ${npc.manners}
- ${npc.quirk}
## Map
${legiblePlacementGuide}
### Keyed Locations
${keydLocations}
`;
    await fs.writeFile(path.join(__temp, "district-gen.md"), content);
  } catch (err) {
    console.error(err);
  }
};

export const genDistrict = async (
  numPOIs: number,
  wealth: Wealth = "common",
): Promise<District> => {
  try {
    const placementGuide = getPlacementGuide(numPOIs);

    const districtContents = await fs.readFile(
      path.join(__copyright, "district.json"),
      { encoding: "utf-8" },
    );
    const { d10Features, d10Issues, features, issues }: DistrictContents =
      JSON.parse(districtContents);

    const featureName = d10Features[wealth][roll.d10()[0]];
    const feature = features.find((feature) => {
      if (featureName === "Vast Market / Revelry Quarters") {
        return (feature.feature = getRandomInt(0, 2)
          ? "Vast Market"
          : "Revelry Quarters");
      }
      return feature.feature === featureName;
    });
    const issueName = d10Issues[wealth][roll.d10()[0]];
    const issue = issues.find((issue) => issue.issue === issueName);

    const sparkContents = await fs.readFile(
      path.join(__copyright, "eb-sparks.json"),
      { encoding: "utf-8" },
    );

    const { touchstones } = JSON.parse(sparkContents);
    const touchstone = Object.values(touchstones)[roll.d8()[0]][roll.d4()[0]];

    const POIs = (await genPOIs(numPOIs)).reduce(
      (keydPOIs, POI, POII) => ({
        ...keydPOIs,
        [POII + 1]: POI,
      }),
      {},
    );

    const npc = await genNpc();
    const street = await genStreet();
    const district = {
      wealth,
      feature,
      issue,
      touchstone,
      npc,
      street,
      POIs,
      placementGuide,
    };
    writeDistrictMd(district);
    return district;
  } catch (err) {
    console.error(err);
  }
};
