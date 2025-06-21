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

interface Building {
  rooms: Room[];
  floorplan: Array<Array<null | number>>;
  secondFloor?: {
    rooms: Room[];
    floorplan: Array<Array<null | number>>;
  };
}
