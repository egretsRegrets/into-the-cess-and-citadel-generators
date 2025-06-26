import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import util from "node:util";
import { genBuilding } from "./building";
import { genDistrict } from "./district";
import { genNpc } from "./npc";
import { genStreet } from "./street";
import { genPOIs } from "./pointOfInterest";
import { genMbSparkNpc, genMbSparkCiv } from "./mb-sparks";

const generable = {
  "spark-civ": {
    process: async (callback: () => any) => {
      const sparkCiv = await genMbSparkCiv();
      console.log(sparkCiv);
      callback();
    },
  },
  "spark-npc": {
    process: async (callback: () => any) => {
      const sparkNpc = await genMbSparkNpc();
      console.log(sparkNpc);
      callback();
    },
  },
  npc: {
    process: async (callback: () => any) => {
      const npc = await genNpc();
      console.log(npc);
      callback();
    },
  },
  street: {
    process: async (callback: () => any) => {
      const street = await genStreet();
      console.log(street);
      callback();
    },
  },
  building: {
    process: async (callback: () => any) => {
      const params = await rl.question(
        "gimme: [rooms-on-floor-one, rooms-on-floor-two]  ",
      );
      rl.prompt();
      const building = await genBuilding(...JSON.parse(params));
      console.log(
        "building: ",
        util.inspect(building, { depth: null, colors: true }),
      );
      callback();
    },
  },
  district: {
    process: async (callback: () => any) => {
      const params = await rl.question(
        "gimme: [number of POIs, wealth (common, middling, rich, opulent)]  ",
      );
      rl.prompt();
      const numPOIs = +params
        .split(",")[0]
        .replace("[", "")
        .replace(",", "")
        .trim();
      const wealth = params.split(",")[1].replace("]", "").trim() as Wealth;
      // const [numPOIsString, wealth] = JSON.parse(params);
      const district = await genDistrict(numPOIs, wealth);
      console.log(
        "district: ",
        util.inspect(district, { depth: null, colors: true }),
      );
      callback();
    },
  },
  "point-of-interest": {
    process: async (callback: () => any) => {
      const POI = await genPOIs();
      console.log(POI);
      callback();
    },
  },
};
const rl = readline.createInterface({ input, output });

async function promptGen() {
  const genRequest = await rl.question(
    `gen what? (${Object.keys(generable).join(", ")})  `,
  );
  rl.prompt();

  if (!Object.keys(generable).includes(genRequest)) {
    console.log(
      `can't gen that. can gen: ${Object.keys(generable).join(", ")}\n`,
    );
    promptGen();
  } else {
    await generable[genRequest].process(promptGen);
  }
}
promptGen();

rl.on("SIGINT", () => {
  rl.pause();
});
