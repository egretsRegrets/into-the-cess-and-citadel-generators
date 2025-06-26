import * as fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import roll from "./roll";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __copyright = path.join(__dirname, "../copyright");

export const genNpc = async (): Promise<Npc> => {
  const npcFile = path.join(__copyright, "npc.json");
  try {
    const npcContents = await fs.readFile(npcFile, { encoding: "utf8" });
    const {
      npcNameProfession,
      npcDetails,
    }: { npcNameProfession: NpcNameProfession[]; npcDetails: any[] } =
      JSON.parse(npcContents);

    const [nameProfessionRoll, detailRoll] = roll.d20(2);

    const { name, profession } = npcNameProfession[nameProfessionRoll];
    const { quirk } = npcDetails[detailRoll];

    // appearance and manners have roll again results, so recursive methods to get these
    function getAppearance(detailRoll) {
      const { appearance } = npcDetails[detailRoll];
      if (appearance.toLocaleLowerCase().includes("roll again twice")) {
        return getAppearance(roll.d20()[0]);
      }
      return appearance;
    }

    function getManners(detailRoll) {
      const { manners } = npcDetails[detailRoll];
      if (manners.toLocaleLowerCase().includes("roll again twice")) {
        return getManners(roll.d20()[0]);
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
