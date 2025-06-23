// Dice

interface DiceType {
  d2: "d2";
  d3: "d3";
  d4: "d4";
  d6: "d6";
  d8: "d8";
  d10: "d10";
  d12: "d12";
  d20: "d20";
  d50: "d50";
  d66: "d66";
  d100: "d100";
}

// d2: (numDice?: number): number[] => rollDice(numDice, 2),

type DiceRollerFn = (numDice?: number) => number[];

type DiceRoller = {
  [key in keyof DiceType]: DiceRollerFn;
};

// roll result proceedure, used when table result calls for subsequent roll on arbitrary table
interface RollResultProceedure {
  dice: {
    type: keyof DiceType;
    num: number;
  };
  table: string;
  subProceedure?: RollResultProceedure;
}

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
