// randomization pinched from https://github.com/3d-dice/dice-box/blob/main/src/helpers/index.js

function randomSeed() {
  const buffer = new Uint32Array(1);
  return crypto.getRandomValues(buffer)[0] / 2 ** 32;
}

function rollDiceBySides(diceSides) {
  // min an dmax assume that we will always be using the result to do 0-based index lookups
  const min = 0;
  const max = diceSides - 1;
  const roll =
    (Math.floor(Math.pow(10, 14) * randomSeed() * randomSeed()) %
      (max - min + 1)) +
    min;
  if (roll > max || roll < min) {
    throw new Error(
      `Something is wrong with the math ih rollDiceBySides, expected that a roll on a dice with ${diceSides} sides (adjusted for 0-based index lookup), should never exceed ${max} or fall below ${min}, but the roll was ${roll}`
    );
  }
  return roll;
}

function rollDice(numDice = 1, diceSides) {
  let rolls = [];
  for (let i = 0; i < numDice; i++) {
    rolls.push(rollDiceBySides(diceSides));
  }
  return rolls;
}

export default {
  d20: (numDice) => rollDice(numDice, 20),
  d50: (numDice) => rollDice(numDice, 50),
  d66: (numDice) => rollDice(numDice, 36),
};
