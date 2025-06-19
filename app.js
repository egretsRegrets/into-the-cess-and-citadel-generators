import * as fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import roll from "./roll.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __copyright = path.join(__dirname, "copyright");

const genNpc = async () => {
  const npcFile = path.join(__copyright, "npc.json");
  try {
    const npcContents = await fs.readFile(npcFile, { encoding: "utf8" });
    const { npcNameProfession, npcDetails } = JSON.parse(npcContents);

    const [nameProfessionRoll, detailRoll] = roll.d20(2);

    const { name, profession } = npcNameProfession[nameProfessionRoll - 1];
    const { quirk } = npcDetails[detailRoll - 1];

    // appearance and manners have roll again results, so recursive methods to get these
    function getAppearance(detailRoll) {
      const { appearance } = npcDetails[detailRoll - 1];
      if (appearance.toLocaleLowerCase().includes("roll again twice")) {
        return getAppearance(roll.d20());
      }
      return appearance;
    }

    function getManners(detailRoll) {
      const { manners } = npcDetails[detailRoll - 1];
      if (manners.toLocaleLowerCase().includes("roll again twice")) {
        return getManners(roll.d20());
      }
      return manners;
    }

    return {
      name,
      profession,
      appearance: getAppearance(detailRoll),
      manners: getManners(detailRoll),
      quirk,
    };
  } catch (err) {
    console.error(err);
  }
};

const npc = await genNpc();

console.log(npc);
