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

function getFloorPlan(roomCount: number): Floorplan {
  const floorplansForRoomCount = Floorplans[roomCount];
  const floorplan =
    floorplansForRoomCount[
      getRandomInt(0, Object.values(floorplansForRoomCount).length)
    ];
  // const floorplan = floorplansForRoomCount[7];
  return floorplan;
}

function drawFloorPlan(floorplan: Floorplan): string {
  const hWall = `#########`;
  const noRoomHSpace = `         `;
  const vWallSpacer = `        `;
  const door = `D`;
  const hWallWithDoor = `####${door}####`;
  // ##########
  // #        #
  // #        #
  // #        #
  // ##########
  let floorplanDrawing = ``;
  floorplan.forEach((row: (number | null)[], rowI) => {
    let rowDrawing = ``;
    // north walls
    row.forEach((room, roomI) => {
      const noRoom = room === null;
      const lastRoom = roomI === row.length - 1;
      // north wall if no room or if room above and room above is not empty
      const nonEmtpyRoomAboveCurrentRoom =
        rowI !== 0 && floorplan[rowI - 1][roomI] !== null;
      const hasNorthWall = !noRoom || nonEmtpyRoomAboveCurrentRoom;
      const northWallHasDoor = !noRoom && nonEmtpyRoomAboveCurrentRoom;
      let northWallSegment;
      if (northWallHasDoor) {
        northWallSegment = hWallWithDoor;
      } else if (hasNorthWall) {
        northWallSegment = hWall;
      } else {
        northWallSegment = noRoomHSpace;
      }
      const drawNorthWestWallCorner =
        !noRoom && (roomI === 0 || row[roomI - 1] === null);
      lastRoom
        ? (rowDrawing = `${rowDrawing}${drawNorthWestWallCorner ? "#" : ""}${northWallSegment}\n`)
        : (rowDrawing = `${rowDrawing}${drawNorthWestWallCorner ? "#" : ""}${northWallSegment}`);
    });
    // east and west walls
    for (let hWallRow = 0; hWallRow < 3; hWallRow++) {
      row.forEach((room, roomI) => {
        const noRoom = room === null;
        const lastRoom = roomI === row.length - 1;
        if (noRoom) {
          lastRoom
            ? (rowDrawing = `${rowDrawing}${noRoomHSpace}\n`)
            : (rowDrawing = `${rowDrawing}${noRoomHSpace}`);
        } else {
          const drawDoor = hWallRow === 1 && typeof row[roomI + 1] === "number";
          const drawWestWall = roomI === 0 || row[roomI - 1] === null;
          lastRoom
            ? (rowDrawing = `${rowDrawing}${drawWestWall ? "#" : ""}${vWallSpacer}\#\n`)
            : (rowDrawing = `${rowDrawing}${drawWestWall ? "#" : ""}${vWallSpacer}${drawDoor ? door : "#"}`);
        }
      });
    }
    // south wall
    if (rowI === floorplan.length - 1) {
      row.forEach((room, roomI) => {
        const noRoom = room === null;
        const southWallSegment = !noRoom ? hWall : noRoomHSpace;
        const drawSouthWestWallCorner =
          (!noRoom && roomI === 0) || (!noRoom && row[roomI - 1] === null);
        rowDrawing = `${rowDrawing}${drawSouthWestWallCorner ? "#" : ""}${southWallSegment}`;
      });
    }
    // console.log("row drawing: ");
    // console.log(`${rowDrawing}`);
    floorplanDrawing = `${floorplanDrawing}${rowDrawing}`;
  });
  return floorplanDrawing;
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

  // gettting the rooms is made complicated by an attempt to limit repeat reooms, currently this is not done between floors
  function getRoomsFromRollResults(rollResults: number[]) {
    const rooms: {
      category: string;
      categoryDescription: string;
      room: string;
      roomDescription: string;
    }[] = [];

    function getUniqueCategory(category: RoomCategory) {
      if (!rooms.some((room) => room.category === category.category)) {
        return category;
      }
      return getUniqueCategory(roomCategories[roll.d6()[0]]);
    }
    function getUniqueRoom(roomName: string, categoryName: string) {
      const roomCategory = roomCategories.find(
        (roomCategory) => roomCategory.category === categoryName,
      );
      if (!rooms.some((room) => room.room === roomName)) {
        return roomCategory.rooms.find((room) => room.name === roomName);
      }
      return getUniqueRoom(
        roomCategory.rooms[
          roomCategory.rooms.length === 3 ? roll.d3()[0] : roll.d2()[0]
        ].name,
        categoryName,
      );
    }

    rollResults.forEach((rollResult: number) => {
      let roomCategory: RoomCategory = roomCategories[rollResult];
      const otherRoomsWithSameCategory = rooms.filter(
        (existingRoom) => existingRoom.category === roomCategory.category,
      );
      if (otherRoomsWithSameCategory.length === roomCategory.rooms.length) {
        roomCategory = getUniqueCategory(roomCategory);
      }

      const room = getUniqueRoom(
        roomCategory.rooms[
          roomCategory.rooms.length === 3 ? roll.d3()[0] : roll.d2()[0]
        ].name,
        roomCategory.category,
      );

      rooms.push({
        category: roomCategory.category,
        categoryDescription: roomCategory.description,
        room: room.name,
        roomDescription: room.description,
      });
    });

    return rooms;
  }

  const rooms: Room[] = getRoomsFromRollResults(
    roomCategoryRollResultsFirstFloor,
  );

  let secondFloor = {};
  if (roomCountSecondFloor) {
    const roomCategoryRollResultsSecondFloor = roll.d6(roomCountSecondFloor);
    const secondFloorFloorplan = getFloorPlan(roomCountSecondFloor);
    const sedondFloorFloorplanDrawing = drawFloorPlan(secondFloorFloorplan);
    secondFloor = {
      secondFloor: {
        rooms: getRoomsFromRollResults(roomCategoryRollResultsSecondFloor),
        floorplan: secondFloorFloorplan,
        floorplanDrawing: `
${sedondFloorFloorplanDrawing}
      `,
      },
    };
  }

  return {
    rooms,
    floorplan,
    floorplanDrawing: `
${drawFloorPlan(floorplan)}
  `,
    ...secondFloor,
  };
};
