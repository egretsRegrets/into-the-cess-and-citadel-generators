import * as fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import roll from "./roll";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __copyright = path.join(__dirname, "../copyright");
const __hillGrabeVisualOracle = path.join(
  __copyright,
  "hillgraab-visual-oracle",
);

export const genHillgraabOracle = async (): Promise<[string, string]> => {
  const rolls = roll.d66(2);
  try {
    const pictoralOracle = await fs.readdir(__hillGrabeVisualOracle);
    const writtenOracle = JSON.parse(
      await fs.readFile(path.join(__copyright, "hillgraab-oracle.json"), {
        encoding: "utf-8",
      }),
    );
    const oracleImgPath = path.join(
      __hillGrabeVisualOracle,
      pictoralOracle[rolls[0]],
    );
    return [writtenOracle[rolls[1]], oracleImgPath];
  } catch (err) {
    console.error(err);
  }
};
