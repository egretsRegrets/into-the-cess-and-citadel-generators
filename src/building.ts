import * as fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import roll from "./roll";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __copyright = path.join(__dirname, "../copyright");

interface RoomCategory {
  category: string;
  description: string;
  rooms: {name: string, description: string}[]
}

export const genBuilding = async (roomsPerFloor: 3 | 4 | 5 | 6 = 3, stories: 1 | 2 = 1): Promise<Building> => {
  const roomCategoryRollResults = roll.d6(roomsPerFloor);
  
  const buildingContents = await fs.readFile(path.join(__copyright, "building.json"), {encoding: "utf-8"});
  const { roomCategories }: { roomCategories: RoomCategory[] } = JSON.parse(buildingContents);

  const rooms: Room[] = roomCategoryRollResults.map((rollResult: number) => {
    const roomCategory = roomCategories[rollResult];
    const room = roomCategory.rooms.length === 3 ? roomCategory.rooms[roll.d3()[0]] : roomCategory.rooms[roll.d2()[0]];
    return {
      category: roomCategory.category,
      categoryDescription: roomCategory.description,
      room: room.name,
      roomDescription: room.description
    }
  });

  return {
    rooms
  };
};

