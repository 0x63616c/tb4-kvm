export function buildTopologySelection(contract, lane, branch) {
  const laneIds = contract.topology.laneIds;
  if (!laneIds.includes(lane)) {
    throw new Error(`Unknown PCB-1A lane: ${lane}`);
  }
  if (branch !== 'HOST_A' && branch !== 'HOST_B') {
    throw new Error(`Unknown PCB-1A host branch: ${branch}`);
  }

  const pathId = `${lane}_${branch}_TO_COMMON`;
  const selectedPath = contract.topology.paths.find(
    (path) => path.id === pathId,
  );
  if (!selectedPath) {
    throw new Error(`Missing PCB-1A path: ${pathId}`);
  }

  const inactiveBranch = branch === 'HOST_A' ? 'HOST_B' : 'HOST_A';
  const applicableStates = contract.pathCampaignRule.applicableStateIds.map(
    (stateId) => {
      const state = contract.measurementStates.find(
        (candidate) => candidate.id === stateId,
      );
      if (!state) {
        throw new Error(`Missing PCB-1A campaign state: ${stateId}`);
      }
      return state;
    },
  );
  const selectedStates = applicableStates.filter(
    (state) => state.activeBranch === branch,
  );
  if (selectedStates.length === 0) {
    throw new Error(`No applicable PCB-1A campaign state for ${branch}`);
  }

  return {
    selectedPath,
    inactiveBranch,
    applicableStates: selectedStates,
    inactivePortIds: selectedStates[0].inactiveTermination.portIds,
  };
}
