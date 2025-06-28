import Roll from "./roll";

export function d6InteractionType(roll: number): ASNodeInteraction {
  return roll < 3 ? "feature" : roll < 5 ? "danger" : "treasure";
}

export const genAdventureSite = async (
  numNodes: number = 6,
): Promise<AdventureSite> => {
  const nodes = [];
  let rolls = Roll.d6(numNodes);

  for (let nodeI = 0; nodeI < numNodes; nodeI++) {
    // 3/6 feature, 2/6 danger, 1/6 treasure
    const roll = rolls[nodeI];
    const interaction = d6InteractionType(roll);

    const node = {
      interaction,
    };
    nodes.push(node);
  }
  return {
    nodes,
  };
};
