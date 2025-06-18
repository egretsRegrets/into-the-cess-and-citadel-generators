import * as fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __copyright = path.join(__dirname, "copyright");

const npcFile = path.join(__copyright, "npc.json");

try {
  const npcContents = await fs.readFile(npcFile, { encoding: "utf8" });
  console.log(npcContents);
} catch (err) {
  console.error(err);
}
