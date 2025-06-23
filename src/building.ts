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
  // const floorplan = floorplansForRoomCount[0];
  // const floorplan = floorplansForRoomCount[7];
  return floorplan;
}

function drawFloorPlan(
  floorplan: Floorplan,
  rooms: Room[],
  hasStairs: boolean,
  floor: 1 | 2,
): string {
  const hWall = `#########`;
  const noRoomHSpace = `        `;
  const vWallSpacer = `        `;
  const door = `D`;
  const hWallWithDoor = `####${door}####`;
  // ##########
  // #        #
  // #        #
  // #        #
  // ##########

  function getNoRoomSpacer(row: (number | null)[], roomI: number) {
    // if there's no wall to the left of the current empty space, need to lead with an empty character (space)
    return row[roomI - 1] === null || roomI === 0
      ? ` ${noRoomHSpace}`
      : noRoomHSpace;
  }

  const roomWithStairs: number | null = hasStairs
    ? getRandomInt(0, rooms.length)
    : null;

  function getRoomMeta(rowI: number, roomI: number) {
    return {
      roomKey: `${floorplan[rowI][roomI] + 1}`,
      hasStairs: floorplan[rowI][roomI] === roomWithStairs,
    };
  }

  // figure out exterior door placement ahead of drawing, assign exterior doors to a row index and room index
  // never put exterior door on hidden room
  // if floorplan contains null rooms, place exterior doors on 1st room that is contiguous with null room
  // if floorplan does not contain null rooms, place exterior doors on NW corner room and SE corner room hWalls
  // if an exterior facing room has no exterior door, 1 in 3 chance wall has window

  // remove doors from walls to hidden rooms???
  // chance of locked doors going into certain kinds of room???

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
        northWallSegment = getNoRoomSpacer(row, roomI);
      }
      const drawNorthWestWallCorner =
        !noRoom && (roomI === 0 || row[roomI - 1] === null);
      lastRoom
        ? (rowDrawing = `${rowDrawing}${drawNorthWestWallCorner ? "#" : ""}${northWallSegment}\n`)
        : (rowDrawing = `${rowDrawing}${drawNorthWestWallCorner ? "#" : ""}${northWallSegment}`);
    });
    // east and west walls
    for (let hWallRow = 0; hWallRow < 4; hWallRow++) {
      row.forEach((room, roomI) => {
        const { roomKey, hasStairs } = getRoomMeta(rowI, roomI);
        const noRoom = room === null;
        const lastRoom = roomI === row.length - 1;
        if (noRoom) {
          const spacer = getNoRoomSpacer(row, roomI);
          // const spacer = noRoomHSpace;
          lastRoom
            ? (rowDrawing = `${rowDrawing}${spacer}\n`)
            : (rowDrawing = `${rowDrawing}${spacer}`);
        } else {
          const middleRow = hWallRow === 1;
          const drawDoor = middleRow && typeof row[roomI + 1] === "number";
          const drawWestWall = roomI === 0 || row[roomI - 1] === null;
          let spacer;
          if (middleRow) {
            spacer = vWallSpacer
              .substring(0, 3)
              .concat(roomKey)
              .concat(vWallSpacer.substring(4));
          } else if (hasStairs && hWallRow === 2) {
            // writing UP or DOWN if their is are stairs
            const stairLegend = floor === 1 ? "UP" : "DOWN";
            spacer = vWallSpacer
              .substring(
                0,
                Math.floor((vWallSpacer.length - stairLegend.length) / 2),
              )
              .concat(stairLegend)
              .concat(
                vWallSpacer.substring(
                  Math.floor((vWallSpacer.length - stairLegend.length) / 2) +
                    stairLegend.length,
                ),
              );
          } else {
            spacer = vWallSpacer;
          }
          lastRoom
            ? (rowDrawing = `${rowDrawing}${drawWestWall ? "#" : ""}${spacer}\#\n`)
            : (rowDrawing = `${rowDrawing}${drawWestWall ? "#" : ""}${spacer}${drawDoor ? door : "#"}`);
        }
      });
    }
    // south wall
    if (rowI === floorplan.length - 1) {
      row.forEach((room, roomI) => {
        const noRoom = room === null;
        const southWallSegment = !noRoom ? hWall : getNoRoomSpacer(row, roomI);
        const drawSouthWestWallCorner =
          (!noRoom && roomI === 0) || (!noRoom && row[roomI - 1] === null);
        rowDrawing = `${rowDrawing}${drawSouthWestWallCorner ? "#" : ""}${southWallSegment}`;
      });
    }
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
    const rooms: Room[] = [];

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
    const secondFloorRooms = getRoomsFromRollResults(
      roomCategoryRollResultsSecondFloor,
    );
    const secondFloorFloorplan = getFloorPlan(roomCountSecondFloor);
    const sedondFloorFloorplanDrawing = drawFloorPlan(
      secondFloorFloorplan,
      secondFloorRooms,
      true,
      2,
    );
    secondFloor = {
      secondFloor: {
        rooms: secondFloorRooms,
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
${drawFloorPlan(floorplan, rooms, !!roomCountSecondFloor, 1)}
  `,
    ...secondFloor,
  };
};
