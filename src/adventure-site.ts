import Roll from "./roll";

export const genAdventureSite = async (
  numNodes: number = 6,
): Promise<AdventureSite> => {
  const nodes = [];
  let rolls = Roll.d6(numNodes);

  for (let nodeI = 0; nodeI < numNodes; nodeI++) {
    // 3/6 feature, 2/6 danger, 1/6 treasure
    const roll = rolls[nodeI];
    const interaction = roll < 3 ? "feature" : roll < 5 ? "danger" : "treasure";

    const node = {
      interaction,
    };
    nodes.push(node);
  }
  return {
    nodes,
  };
};
