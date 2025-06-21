import * as fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import roll from "./roll";
import { Floorplans } from "./floorplan.const";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __copyright = path.join(__dirname, "../copyright");

interface RoomCategory {
  category: string;
  description: string;
  rooms: { name: string; description: string }[];
}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function getFloorPlan(roomCount: number): Array<Array<null | number>> {
  const floorplansForRoomCount = Floorplans[roomCount];
  const floorplan =
    floorplansForRoomCount[
      getRandomInt(0, Object.values(floorplansForRoomCount).length)
    ];
  return floorplan;
}

export const genBuilding = async (
  roomCountFirstFloor: 3 | 4 | 5 | 6 = 3,
  roomCountSecondFloor: 0 | 2 | 3 | 4 = 0,
): Promise<Building> => {
  const roomCategoryRollResultsFirstFloor = roll.d6(roomCountFirstFloor);
  const floorplan = getFloorPlan(roomCountFirstFloor);

  const buildingContents = await fs.readFile(
    path.join(__copyright, "building.json"),
    { encoding: "utf-8" },
  );
  const { roomCategories }: { roomCategories: RoomCategory[] } =
    JSON.parse(buildingContents);

  function rollResultToRoom(rollResult: number) {
    const roomCategory = roomCategories[rollResult];
    const room =
      roomCategory.rooms.length === 3
        ? roomCategory.rooms[roll.d3()[0]]
        : roomCategory.rooms[roll.d2()[0]];
    return {
      category: roomCategory.category,
      categoryDescription: roomCategory.description,
      room: room.name,
      roomDescription: room.description,
    };
  }

  const rooms: Room[] = roomCategoryRollResultsFirstFloor.map(rollResultToRoom);

  let secondFloor = {};
  if (roomCountSecondFloor) {
    const roomCategoryRollResultsSecondFloor = roll.d6(roomCountSecondFloor);
    secondFloor = {
      secondFloor: {
        rooms: roomCategoryRollResultsSecondFloor.map(rollResultToRoom),
        floorplan: getFloorPlan(roomCountSecondFloor),
      },
    };
  }

  return {
    rooms,
    floorplan,
    ...secondFloor,
  };
};
