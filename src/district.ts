import { genPOIs } from "./pointOfInterest";
const pointsOfInterest = await genPOIs();
console.log("point of interest: ", pointsOfInterest);

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function getPlacementGuide(numPOIs: number): POIPlacementGuide {
  function getPlacementInterface() {
    return [
      [2, 3],
      getRandomInt(0, 2) ? [1, 2, 3] : [2, 3, 4],
      [1, 2, 3, 4],
      [1, 2, 3, 4, 5],
      [1, 2, 3, 4],
      getRandomInt(0, 2) ? [1, 2, 3] : [2, 3, 4],
      [2, 3],
    ];
  }

  const placementGuide = [
    [[], [], [], [], [], []],
    [[], [], [], [], [], []],
    [[], [], [], [], [], []],
    [[], [], [], [], [], []],
    [[], [], [], [], [], []],
    [[], [], [], [], [], []],
    [[], [], [], [], [], []],
  ];

  const placementInterface = getPlacementInterface();
  const POIs = Array.from(Array(numPOIs)).map((_, i) => i);
  while (POIs.length > 0) {
    const randomRowIndex = getRandomInt(0, 7);
    let interfaceRow = placementInterface[randomRowIndex];
    const randomAvailableIndex =
      interfaceRow[getRandomInt(0, interfaceRow.length)];
    if (
      typeof placementGuide[randomRowIndex][randomAvailableIndex][0] !==
      "number"
    ) {
      interfaceRow = interfaceRow.filter(
        (availableIndex) => availableIndex !== randomAvailableIndex,
      );
      placementGuide[randomRowIndex][randomAvailableIndex].push(
        POIs.shift() + 1,
      );
    }
  }

  return placementGuide;
}

export const genDistrict = async (numPOIs: number): Promise<District> => {
  const placementGuide = getPlacementGuide(numPOIs);
  const POIs = (await genPOIs(numPOIs)).reduce(
    (keydPOIs, POI, POII) => ({
      ...keydPOIs,
      [POII + 1]: POI,
    }),
    {},
  );
  return {
    POIs,
    placementGuide,
  };
};
