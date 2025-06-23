// npc
interface NpcNameProfession {
  name: string;
  profession: string;
}

// building
interface Room {
  category: string;
  categoryDescription: string;
  room: string;
  roomDescription: string;
}

type Floorplan = Array<Array<null | number>>;

interface Building {
  rooms: Room[];
  floorplan: Array<Array<null | number>>;
  floorplanDrawing: string;
  secondFloor?: {
    rooms: Room[];
    floorplan: Floorplan;
    floorplanDrawing: string;
  };
}
