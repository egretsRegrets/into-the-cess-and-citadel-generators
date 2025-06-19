import * as fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import roll from "./roll";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __copyright = path.join(__dirname, "../copyright");

const building = () => {};

export default building;
