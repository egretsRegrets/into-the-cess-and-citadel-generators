import * as fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import roll from "./roll";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __copyright = path.join(__dirname, "../copyright");

export const genStreet = async () => {
  const streetFile = path.join(__copyright, "street.json");
  try {
    const streetContent = await fs.readFile(streetFile, { encoding: "utf-8" });
    const { namePrefix, nameSuffix, description } = JSON.parse(streetContent);
    return {
      name: `${namePrefix[roll.d50()[0]]} ${nameSuffix[roll.d20()[0]]}`,
      description: description[roll.d66()[0]],
    };
  } catch (err) {
    console.error(err);
  }
};
