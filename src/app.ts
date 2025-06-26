import * as fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import util from "node:util";
import roll from "./roll";
import { genBuilding } from "./building";
import { genDistrict } from "./district";
import { genNpc } from "./npc";
import { genStreet } from "./street";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __copyright = path.join(__dirname, "../copyright");

// const npc = await genNpc();
// const street = await genStreet();
const building = await genBuilding(6, 3);
const district = await genDistrict(6);

// console.log("npc:", npc);
// console.log("street:", street);
console.log(
  "building: ",
  util.inspect(building, { depth: null, colors: true }),
);
console.log(
  "district: ",
  util.inspect(district, { depth: null, colors: true }),
);
