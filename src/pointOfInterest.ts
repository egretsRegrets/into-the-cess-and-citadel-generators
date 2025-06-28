import * as fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import roll from "./roll";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __copyright = path.join(__dirname, "../copyright");

interface EbSparks {
  bastion: [string[], string[]];
  deepCountry: [string[], string[]];
  underground: [string[], string[]];
}

/*
How to get everything for a point of interest
1. Get the point type: d6: 1: monster; 2-3: hazard/hazardous POI; 4-5: POI; 6: shlter/shop
2. Grab a handful of sparks
3. Grab a building — this is a fallback from the sparks (really the sparks might be enough)
*/

function getInteractionFromRoll(roll: number): POIInteraction {
  if (roll === 0) {
    return "monster";
  }
  if (roll > 0 && roll < 3) {
    return "hazard / hazardous POI";
  }
  if (roll > 2 && roll < 5) {
    return "POI";
  }
  if (roll === 5) {
    return "shelter/shop";
  }
}

export const genPOIs = async (
  numOfPOIs: number = 1,
): Promise<PointOfInterest[]> => {
  try {
    let POIs: PointOfInterest[] = [];
    const sparksContents = await fs.readFile(
      path.join(__copyright, "eb-sparks.json"),
      { encoding: "utf-8" },
    );
    const { bastion, deepCountry, underground } = JSON.parse(sparksContents);
    const MIRBuildingContents = await fs.readFile(
      path.join(__copyright, "MIR-building.json"),
      { encoding: "utf-8" },
    );
    const structureContents = JSON.parse(
      await fs.readFile(path.join(__copyright, "windwraith-structures.json"), {
        encoding: "utf-8",
      }),
    );

    for (let POII = 0; POII < numOfPOIs; POII++) {
      const interaction = getInteractionFromRoll(roll.d6()[0]);
      let sparks: [string, string, string];
      let building: { type: string; description: string };

      sparks = [bastion, deepCountry, underground].reduce(
        (sparksAcc, sparkTable: [string[], string[]]) => [
          ...sparksAcc,
          `${sparkTable[0][roll.d20()[0]]} ${sparkTable[1][roll.d20()[0]]}`,
        ],
        [],
      );

      const buildings: { buildingType: string; description: string }[] =
        JSON.parse(MIRBuildingContents);
      const { buildingType: type, description } = buildings[roll.d100()[0]];
      building = { type, description };
      const structure = structureContents[roll.d3()[0]][roll.d20()[0]];
      POIs.push({
        interaction,
        sparks,
        building,
        altStructure: structure,
      });
    }

    return POIs;
  } catch (err) {
    console.error(err);
  }
};
