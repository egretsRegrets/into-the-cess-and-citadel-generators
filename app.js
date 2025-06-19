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

    const { name, profession } = npcNameProfession[nameProfessionRoll];
    const { quirk } = npcDetails[detailRoll];

    // appearance and manners have roll again results, so recursive methods to get these
    function getAppearance(detailRoll) {
      const { appearance } = npcDetails[detailRoll];
      if (appearance.toLocaleLowerCase().includes("roll again twice")) {
        return getAppearance(roll.d20());
      }
      return appearance;
    }

    function getManners(detailRoll) {
      const { manners } = npcDetails[detailRoll];
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

const genStreet = async () => {
  const streetFile = path.join(__copyright, "street.json");
  try {
    const streetContent = await fs.readFile(streetFile, { encoding: "utf-8" });
    const { namePrefix, nameSuffix, description } = JSON.parse(streetContent);
    return {
      name: `${namePrefix[roll.d50()]} ${nameSuffix[roll.d20()]}`,
      description: description[roll.d66()],
    };
  } catch (err) {
    console.error(err);
  }
};

const npc = await genNpc();
const street = await genStreet();

console.log("npc:", npc);
console.log("street:", street);
