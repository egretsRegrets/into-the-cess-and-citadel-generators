
// npc
interface NpcNameProfession {
  name: string;
  profession: string;
}

// building
interface Room {
  category: string,
  categoryDescription: string,
  room: string,
  roomDescription: string
}

interface Building {
  rooms: Room[]
}