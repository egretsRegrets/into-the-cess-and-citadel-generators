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

interface Npc extends NpcNameProfession {
  appearance: any;
  manners: any;
  quirk: any;
}

// sparks from Mythic Bastionland
interface MbSparkNpc {
  appearance: { physique: string; dress: string };
  task: { action: string; subject: string };
  voice: { tone: string; manner: string };
  background: { upbringing: string; memory: string };
  ailment: { descriptor: string; symptom: string };
  heraldry: { palette: string; symbol: string };
  relationship: { state: string; connection: string };
  desire: { ambition: string; motive: string };
}

interface MbSparkCiv {
  drama: { theme: string; detail: string };
  woe: { description: string; incident: string };
  news: { subject: string; mood: string };
  bailey: { style: string; feature: string };
  keep: { centrepiece: string; decoration: string };
  holding: { style: string; feature: string };
  luxuries: { rarity: string; type: string };
  goods: { theme: string; type: string };
  food: { quality: string; type: string };
}

// adventure site
type ASNodeInteraction = "feature" | "danger" | "treasure";

interface ASNode {
  interaction: ASNodeInteraction;
}

interface AdventureSite {
  nodes: ASNode[];
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

// point of interest
type POIInteraction =
  | "monster"
  | "hazard / hazardous POI"
  | "POI"
  | "shelter/shop";

interface PointOfInterest {
  interaction: POIInteraction;
  sparks: [string, string, string];
  building: {
    type: string;
    description: string;
  };
}

// district
type Wealth = "common" | "middling" | "rich" | "opulent";
type POIPlacementGuide = Array<Array<Array<undefined | number>>>;

interface District {
  wealth: Wealth;
  feature: {
    feature: string;
    description: string;
  };
  issue: {
    issue: string;
    description: string;
  };
  street: {
    name: string;
    description: string;
  };
  touchstone: string;
  sparks: MbSparkCiv;
  npc: Npc;
  personage: MbSparkNpc;
  POIs: { [POIKey: string]: PointOfInterest };
  placementGuide: POIPlacementGuide;
}
