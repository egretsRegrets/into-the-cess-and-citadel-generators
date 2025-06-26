import * as fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import roll from "./roll";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __copyright = path.join(__dirname, "../copyright");

const deriveNestedSparksReducer = (derivedSparks, [sparkName, sparkTbl]) => {
  const [roll1, roll2] = roll.d12(2);
  const [[col1Name, col1Results], [col2Name, col2Results]] =
    Object.entries(sparkTbl);
  return {
    ...derivedSparks,
    [sparkName]: {
      [col1Name]: `${col1Results[roll1]}`,
      [col2Name]: `${col2Results[roll2]}`,
    },
  };
};

export const genMbSparkNpc = async (): Promise<MbSparkNpc> => {
  try {
    const mbSparksContent = await fs.readFile(
      path.join(__copyright, "mythic-bastionland-sparks.json"),
      { encoding: "utf-8" },
    );
    const { people: npcSparks } = JSON.parse(mbSparksContent);
    return Object.entries(npcSparks).reduce(deriveNestedSparksReducer, {});
  } catch (err) {
    console.error(err);
  }
};

export const genMbSparkCiv = async (): Promise<MbSparkCiv> => {
  try {
    const mbSparksContent = await fs.readFile(
      path.join(__copyright, "mythic-bastionland-sparks.json"),
      { encoding: "utf-8" },
    );
    const { civilization: civSpark } = JSON.parse(mbSparksContent);
    return Object.entries(civSpark).reduce(deriveNestedSparksReducer, {});
  } catch (err) {
    console.error(err);
  }
};
