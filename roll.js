// randomization pinched from https://github.com/3d-dice/dice-box/blob/main/src/helpers/index.js

function randomSeed() {
  const buffer = new Uint32Array(1);
  return crypto.getRandomValues(buffer)[0] / 2 ** 32;
}

function rollDiceBySides(diceType) {
  return (
    (Math.floor(Math.pow(10, 14) * randomSeed() * randomSeed()) %
      (diceType - 1 + 1)) +
    1
  );
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
};
