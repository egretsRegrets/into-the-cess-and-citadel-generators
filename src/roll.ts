// randomization pinched from https://github.com/3d-dice/dice-box/blob/main/src/helpers/index.js

function randomSeed(): number {
  const buffer = new Uint32Array(1);
  return crypto.getRandomValues(buffer)[0] / 2 ** 32;
}

function rollDiceBySides(diceSides: number): number {
  // min an dmax assume that we will always be using the result to do 0-based index lookups
  const min = 0;
  const max = diceSides - 1;
  const roll: number =
    (Math.floor(Math.pow(10, 14) * randomSeed() * randomSeed()) %
      (max - min + 1)) +
    min;
  if (roll > max || roll < min) {
    throw new Error(
      `Something is wrong with the math ih rollDiceBySides, expected that a roll on a dice with ${diceSides} sides (adjusted for 0-based index lookup), should never exceed ${max} or fall below ${min}, but the roll was ${roll}`,
    );
  }
  return roll;
}

function rollDice(numDice = 1, diceSides: number): number[] {
  let rolls: number[] = [];
  for (let i = 0; i < numDice; i++) {
    rolls.push(rollDiceBySides(diceSides));
  }
  return rolls;
}

const Roll: Partial<DiceRoller> = {
  d2: (numDice?: number): number[] => rollDice(numDice, 2),
  d3: (numDice?: number): number[] => rollDice(numDice, 3),
  d4: (numDice?: number): number[] => rollDice(numDice, 4),
  d6: (numDice?: number): number[] => rollDice(numDice, 6),
  d8: (numDice?: number): number[] => rollDice(numDice, 8),
  d10: (numDice?: number): number[] => rollDice(numDice, 10),
  d20: (numDice?: number): number[] => rollDice(numDice, 20),
  d50: (numDice?: number): number[] => rollDice(numDice, 50),
  d66: (numDice?: number): number[] => rollDice(numDice, 36),
  d100: (numDice?: number): number[] => rollDice(numDice, 100),
};

export default Roll;
