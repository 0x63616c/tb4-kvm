import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';

const dir = path.resolve(import.meta.dirname);
const root = path.resolve(dir, '..', '..');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function asObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value
    : {};
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function sameArray(actual, expected) {
  return actual.length === expected.length &&
    actual.every((value, index) => value === expected[index]);
}

function sameObject(actual, expected) {
  const actualObject = asObject(actual);
  const actualKeys = Object.keys(actualObject).sort();
  const expectedKeys = Object.keys(expected).sort();
  return sameArray(actualKeys, expectedKeys) &&
    expectedKeys.every((key) => actualObject[key] === expected[key]);
}

function sameJson(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function unique(values, label, errors) {
  if (new Set(values).size !== values.length) errors.push(`${label} must be unique`);
}

const expectedLanes = ['D0', 'D1', 'D2', 'D3'];
const expectedBranches = [
  {id: 'HOST_A', role: 'SELECTABLE_INPUT'},
  {id: 'COMMON', role: 'SELECTABLE_OUTPUT'},
  {id: 'HOST_B', role: 'SELECTABLE_INPUT'},
];
const expectedStateIds = [
  'UNPOWERED',
  'POWERED_ALL_PATHS_HIZ',
  'A_SELECTED_B_MATCHED',
  'B_SELECTED_A_MATCHED',
  'A_SELECTED_B_OPEN',
  'B_SELECTED_A_OPEN',
];
const expectedSourceContracts = [
  {
    id: 'PCB1A_MEASUREMENT_MATRIX',
    path: 'design/pcb1a-measurement-matrix.json',
    role: 'LANE_STATE_STRUCTURE_PARITY',
  },
  {
    id: 'CHANNEL_BUDGET_CONTRACT',
    path: 'design/channel-budget/prototype-a-example.json',
    role: 'PORT_ORDER_AND_RF_BOUNDARY_REFERENCE',
  },
  {
    id: 'ISSUE5_PARTS_EVIDENCE',
    path: 'design/parts-evidence/issue-5-inventory.json',
    role: 'PROVISIONAL_PART_IDENTITIES_ONLY',
  },
];
const expectedReferencePlanes = [
  {id: 'CABLE_END', role: 'CALIBRATED_RAW', status: 'PROPOSED_UNMEASURED'},
  {id: 'PCB_PACKAGE_LANDS', role: 'DEEMBEDDED_TARGET', status: 'PROPOSED_UNMEASURED'},
];
const expectedControlMappings = [
  {id: 'UNPOWERED_ALL_PATHS_DISABLED', muxEnable: 'DISABLED', muxSelect: 'HOST_A'},
  {id: 'POWERED_ALL_PATHS_DISABLED', muxEnable: 'DISABLED', muxSelect: 'HOST_A'},
  {id: 'HOST_A_ENABLED', muxEnable: 'ENABLED', muxSelect: 'HOST_A'},
  {id: 'HOST_B_ENABLED', muxEnable: 'ENABLED', muxSelect: 'HOST_B'},
];
const expectedHostToCommonTemplate = [
  'HOST_PORT', 'RF_LAUNCH_SLOT', 'OPTIONAL_ESD_SLOT', 'MUX_BRANCH_SLOT',
  'MUX_COMMON_SLOT', 'OPTIONAL_ESD_SLOT', 'RF_LAUNCH_SLOT', 'COMMON_PORT',
];
const expectedHostBranchIsolation = {
  directHostAToHostBNetAllowed: false,
  inactiveBranchTerminationRequired: true,
  allowedInactiveTerminationKinds: ['matched_50ohm', 'open'],
};
const expectedControls = [
  {id: 'MUX_ENABLE', safeDefault: 'DISABLED', source: 'EXTERNAL_STATIC_TEST_CONTROL'},
  {id: 'MUX_SELECT', safeDefault: 'HOST_A', source: 'EXTERNAL_STATIC_TEST_CONTROL'},
];
const expectedStructureClasses = [
  {
    id: 'DUT_FIXTURE', kind: 'DUT_FIXTURE', required: true,
    instanceRule: 'ONE_PER_MATERIALLY_DISTINCT_LAUNCH_ESCAPE_X_ESD_POPULATION',
    requiredVariantAxes: ['LAUNCH_ESCAPE', 'OPTIONAL_ESD_POPULATION_FITTED_OR_DNP'],
    instanceCount: null, instanceCountStatus: 'BLOCKED_UNTIL_LAUNCH_ESD_STACKUP_FREEZE',
    notes: 'Candidate mux path only; no footprint, launch, or ESD population is frozen.',
  },
  {
    id: 'PLAIN_NO_MUX_THRU', kind: 'PLAIN_THRU_COMPARATOR', required: true,
    instanceRule: 'ONE_PER_MATERIALLY_DISTINCT_LAUNCH_ESCAPE',
    requiredVariantAxes: ['LAUNCH_ESCAPE'], instanceCount: null,
    instanceCountStatus: 'BLOCKED_UNTIL_LAUNCH_ESD_STACKUP_FREEZE',
    notes: 'Comparator only, never automatic network extraction.',
  },
  {
    id: 'TWO_X_THRU', kind: '2X_THRU', required: true,
    instanceRule: 'ONE_PER_MATERIALLY_DISTINCT_LAUNCH_ESCAPE',
    requiredVariantAxes: ['LAUNCH_ESCAPE'], instanceCount: null,
    instanceCountStatus: 'BLOCKED_UNTIL_LAUNCH_ESD_STACKUP_FREEZE',
    notes: 'Symmetric IEEE 370 or lab-accepted fixture class; later instances follow frozen launch/escape variants.',
  },
  {
    id: 'INACTIVE_PORT_TERMINATION_FIXTURE', kind: 'TERMINATION_FIXTURE', required: true,
    instanceRule: 'AS_REQUIRED_BY_FROZEN_LAB_TERMINATION_IMPLEMENTATION',
    requiredVariantAxes: ['TERMINATION_KIND'], instanceCount: null,
    instanceCountStatus: 'BLOCKED_UNTIL_LAB_AND_LAUNCH_FREEZE',
    notes: 'Repeatable matched/open cable-end termination class; no instance count is claimed.',
  },
];
const expectedCampaignRule = {
  scope: 'ONE_HOST_TO_COMMON_PATH_AT_A_TIME_4_PORT',
  applicableStateIds: [
    'A_SELECTED_B_MATCHED', 'B_SELECTED_A_MATCHED',
    'A_SELECTED_B_OPEN', 'B_SELECTED_A_OPEN',
  ],
  measurementPlane: 'CABLE_END',
  measuredPortRule: 'EXACTLY_THE_FOUR_PN_ENDPOINTS_OF_THE_PATH',
  stateApplicabilityRule: 'ONLY_STATES_SELECTING_PATH_ACTIVE_BRANCH',
  inactiveBundlePortRule: 'EXACTLY_THE_EIGHT_STATE_INACTIVE_TERMINATION_PORT_IDS',
  inactiveBundleTerminationRule: 'USE_THE_SELECTED_STATE_INACTIVE_TERMINATION_KIND',
  remainingUnmeasuredPortRule: 'ALL_REMAINING_12_UNMEASURED_CABLE_END_PORTS',
  remainingUnmeasuredTerminationKind: 'matched_50ohm',
  expectedMeasuredPortCount: 4,
  expectedInactiveBundlePortCount: 8,
  expectedRemainingUnmeasuredPortCount: 12,
  campaignStatus: 'PROPOSED_UNBOOKED',
};
const expectedReviewInputs = {
  requiredBeforeSchematic: [
    'ISSUE5_MODEL_AND_SOURCE_GATE', 'ISSUE7_STACKUP_AND_DFM_GATE', 'ISSUE8_TOPOLOGY_REVIEW',
  ],
  requiredBeforeOrder: [
    'ISSUE5_MODEL_AND_SOURCE_GATE', 'ISSUE7_STACKUP_AND_DFM_GATE',
    'CHANNEL_BUDGET_CLOSURE', 'INDEPENDENT_SI_REVIEW', 'MANUFACTURING_RELEASE_REVIEW',
  ],
  notClaimedByThisContract: [
    'USB4_OR_THUNDERBOLT_COMPLIANCE', 'ORDER_READINESS',
    'FABRICATOR_ACCEPTANCE', 'MEASURED_CHANNEL_LIMITS',
  ],
};

function inactivePorts(branch) {
  return expectedLanes.flatMap((lane) => [`${lane}_${branch}_P`, `${lane}_${branch}_N`]);
}

const expectedStates = [
  {
    id: 'UNPOWERED',
    activeBranch: null,
    inactiveTermination: {kind: 'not_applicable', fixtureId: null, planeId: null, portIds: []},
    powerState: 'unpowered',
    hiZAuthority: 'NOT_APPLICABLE',
    controlState: 'UNPOWERED_ALL_PATHS_DISABLED',
  },
  {
    id: 'POWERED_ALL_PATHS_HIZ',
    activeBranch: null,
    inactiveTermination: {
      kind: 'HiZ',
      fixtureId: 'INACTIVE_PORT_TERMINATION_FIXTURE',
      planeId: 'CABLE_END',
      portIds: [],
    },
    powerState: 'powered',
    hiZAuthority: 'CONDITIONAL_BLOCKED_ON_AUTHORITATIVE_DEVICE_STATE_EVIDENCE',
    controlState: 'POWERED_ALL_PATHS_DISABLED',
  },
  {
    id: 'A_SELECTED_B_MATCHED',
    activeBranch: 'HOST_A',
    inactiveTermination: {
      kind: 'matched_50ohm',
      fixtureId: 'INACTIVE_PORT_TERMINATION_FIXTURE',
      planeId: 'CABLE_END',
      portIds: inactivePorts('B'),
    },
    powerState: 'powered',
    hiZAuthority: 'NOT_APPLICABLE',
    controlState: 'HOST_A_ENABLED',
  },
  {
    id: 'B_SELECTED_A_MATCHED',
    activeBranch: 'HOST_B',
    inactiveTermination: {
      kind: 'matched_50ohm',
      fixtureId: 'INACTIVE_PORT_TERMINATION_FIXTURE',
      planeId: 'CABLE_END',
      portIds: inactivePorts('A'),
    },
    powerState: 'powered',
    hiZAuthority: 'NOT_APPLICABLE',
    controlState: 'HOST_B_ENABLED',
  },
  {
    id: 'A_SELECTED_B_OPEN',
    activeBranch: 'HOST_A',
    inactiveTermination: {
      kind: 'open',
      fixtureId: 'INACTIVE_PORT_TERMINATION_FIXTURE',
      planeId: 'CABLE_END',
      portIds: inactivePorts('B'),
    },
    powerState: 'powered',
    hiZAuthority: 'NOT_APPLICABLE',
    controlState: 'HOST_A_ENABLED',
  },
  {
    id: 'B_SELECTED_A_OPEN',
    activeBranch: 'HOST_B',
    inactiveTermination: {
      kind: 'open',
      fixtureId: 'INACTIVE_PORT_TERMINATION_FIXTURE',
      planeId: 'CABLE_END',
      portIds: inactivePorts('A'),
    },
    powerState: 'powered',
    hiZAuthority: 'NOT_APPLICABLE',
    controlState: 'HOST_B_ENABLED',
  },
];

const expectedPaths = expectedLanes.flatMap((lane) => [
  {
    id: `${lane}_HOST_A_TO_COMMON`,
    lane,
    activeBranch: 'HOST_A',
    endpointPortIds: [`${lane}_A_P`, `${lane}_A_N`, `${lane}_C_P`, `${lane}_C_N`],
  },
  {
    id: `${lane}_HOST_B_TO_COMMON`,
    lane,
    activeBranch: 'HOST_B',
    endpointPortIds: [`${lane}_B_P`, `${lane}_B_N`, `${lane}_C_P`, `${lane}_C_N`],
  },
]);

function sameTermination(actual, expected) {
  const termination = asObject(actual);
  return termination.kind === expected.kind &&
    termination.fixtureId === expected.fixtureId &&
    termination.planeId === expected.planeId &&
    sameArray(asArray(termination.portIds), expected.portIds);
}

function sameState(actual, expected) {
  const state = asObject(actual);
  return state.id === expected.id &&
    state.activeBranch === expected.activeBranch &&
    sameTermination(state.inactiveTermination, expected.inactiveTermination) &&
    state.powerState === expected.powerState &&
    state.hiZAuthority === expected.hiZAuthority &&
    state.controlState === expected.controlState;
}

function checkExactRecords(actual, expected, label, errors) {
  const records = asArray(actual).map(asObject);
  if (records.length !== expected.length ||
      !records.every((record, index) => sameJson(record, expected[index])))
    errors.push(`${label} must exactly match the RF-only contract`);
}

function inventoryPart(parts, exactOpn) {
  return asArray(asObject(parts).parts).map(asObject)
    .find((part) => part.exact_opn === exactOpn);
}

function checkPart(part, expectedFunction, expectedDisposition, label, errors) {
  if (!part || part.function !== expectedFunction ||
      part.disposition !== expectedDisposition ||
      !String(part.broadband_model ?? '').startsWith('BLOCKED'))
    errors.push(`${label} must remain tied to the blocked issue-5 inventory record`);
}

export function validateDocument(doc, references = {}) {
  const errors = [];
  const safeDoc = asObject(doc);
  const safeReferences = asObject(references);
  let schema;
  let matrix;
  let prototype;
  let parts;
  try {
    schema = safeReferences.schema ?? readJson('design/pcb1a/topology.schema.json');
    matrix = safeReferences.matrix ?? readJson('design/pcb1a-measurement-matrix.json');
    prototype = safeReferences.prototype ?? readJson('design/channel-budget/prototype-a-example.json');
    parts = safeReferences.parts ?? readJson('design/parts-evidence/issue-5-inventory.json');
    const ajv = new Ajv2020({allErrors: true, strict: true, allowUnionTypes: true});
    const checkSchema = ajv.compile(schema);
    if (!checkSchema(doc))
      errors.push(...(checkSchema.errors ?? []).map((error) =>
        `${error.instancePath || '/'} ${error.message}`));
  } catch (error) {
    errors.push(`validator inputs must be readable and schema-valid: ${error.message}`);
    schema = {};
    matrix = {};
    prototype = {};
    parts = {};
  }

  if (safeDoc.status !== 'PROPOSED') errors.push('status must remain PROPOSED');
  if (safeDoc.orderReady !== false) errors.push('orderReady must remain false');
  const boundary = asObject(safeDoc.claimBoundary);
  if (boundary.usb4OrThunderboltComplianceClaimAuthorized !== false)
    errors.push('USB4/Thunderbolt compliance claim must remain unauthorized');
  for (const field of ['containsUsbC', 'containsCc', 'containsPd', 'containsVbus',
    'containsVconn', 'containsRouter', 'containsMcu', 'containsProductPower'])
    if (boundary[field] !== false) errors.push(`claim boundary ${field} must be false`);
  if (!sameArray(asArray(boundary.prohibitedDomains),
    ['USB-C', 'CC', 'PD', 'VBUS', 'VCONN', 'ROUTER', 'MCU', 'PRODUCT_POWER']))
    errors.push('prohibited domain list must remain the complete RF-only exclusion set');

  checkExactRecords(safeDoc.sourceContracts, expectedSourceContracts,
    'source contracts', errors);
  const topology = asObject(safeDoc.topology);
  if (!sameArray(asArray(topology.laneIds), expectedLanes))
    errors.push('lane IDs must exactly match D0-D3 in order');
  checkExactRecords(topology.branches, expectedBranches, 'branch roles', errors);
  checkExactRecords(topology.referencePlanes, expectedReferencePlanes,
    'reference planes', errors);

  const ports = asArray(topology.ports).map(asObject);
  unique(ports.map((port) => port.id), 'port IDs', errors);
  unique(ports.map((port) => port.singleEndedNumber), 'single-ended port numbers', errors);
  if (ports.length !== 24) errors.push('topology must expose exactly 24 RF single-ended ports');
  const expectedPortIds = new Set();
  for (const lane of expectedLanes)
    for (const branch of ['A', 'C', 'B'])
      for (const polarity of ['P', 'N']) expectedPortIds.add(`${lane}_${branch}_${polarity}`);
  const actualPortIds = new Set(ports.map((port) => port.id));
  if (expectedPortIds.size !== actualPortIds.size ||
      [...expectedPortIds].some((id) => !actualPortIds.has(id)))
    errors.push('every lane must have A/C/B P,N ports and no hidden or extra port');
  for (const port of ports) {
    const branchId = port.branch === 'HOST_A' ? 'A' :
      port.branch === 'HOST_B' ? 'B' : 'C';
    if (port.id !== `${port.lane}_${branchId}_${port.polarity}`)
      errors.push(`port ${port.id} does not match its lane/branch/polarity fields`);
  }
  const portNumbers = ports.map((port) => port.singleEndedNumber).sort((a, b) => a - b);
  if (!sameArray(portNumbers, Array.from({length: 24}, (_, index) => index + 1)))
    errors.push('port numbers must be exactly 1 through 24');
  const pathTemplates = asObject(topology.pathTemplates);
  if (!sameArray(asArray(pathTemplates.hostToCommon), expectedHostToCommonTemplate))
    errors.push('host-to-common path template must exactly match the RF-only sequence');
  if (JSON.stringify(pathTemplates.hostBranchIsolation) !== JSON.stringify(expectedHostBranchIsolation))
    errors.push('host branch isolation invariant must exactly prohibit direct A-to-B nets and require matched/open inactive termination');
  const paths = asArray(topology.paths).map(asObject);
  if (paths.length !== expectedPaths.length ||
      !paths.every((pathRecord, index) =>
        sameObject({...pathRecord, endpointPortIds: undefined}, {
          ...expectedPaths[index], endpointPortIds: undefined,
        }) && sameArray(asArray(pathRecord.endpointPortIds), expectedPaths[index].endpointPortIds)))
    errors.push('paths must exactly cover every lane/A-or-B P,N endpoint to common');
  unique(paths.map((pathRecord) => pathRecord.id), 'path IDs', errors);

  const campaignRule = asObject(safeDoc.pathCampaignRule);
  if (!sameJson(campaignRule, expectedCampaignRule))
    errors.push('one-path-at-a-time 4-port campaign rule must exactly map measured and all unmeasured conductors');
  const allCablePortIds = expectedPaths.flatMap((pathRecord) => pathRecord.endpointPortIds)
    .filter((portId, index, values) => values.indexOf(portId) === index);
  for (const pathRecord of expectedPaths) {
    for (const state of expectedStates.filter((candidate) =>
      candidate.activeBranch === pathRecord.activeBranch &&
      ['matched_50ohm', 'open'].includes(candidate.inactiveTermination.kind))) {
      const measured = pathRecord.endpointPortIds;
      const inactiveBundle = state.inactiveTermination.portIds;
      const remainingUnmeasured = allCablePortIds.filter((portId) =>
        !measured.includes(portId) && !inactiveBundle.includes(portId));
      const allCampaignPorts = [...measured, ...inactiveBundle, ...remainingUnmeasured];
      if (measured.length !== campaignRule.expectedMeasuredPortCount ||
          inactiveBundle.length !== campaignRule.expectedInactiveBundlePortCount ||
          remainingUnmeasured.length !== campaignRule.expectedRemainingUnmeasuredPortCount ||
          allCablePortIds.length !== 24 ||
          new Set(allCampaignPorts).size !== allCablePortIds.length ||
          !allCablePortIds.every((portId) => allCampaignPorts.includes(portId)) ||
          state.inactiveTermination.planeId !== campaignRule.measurementPlane ||
          state.inactiveTermination.kind !== (state.id.includes('MATCHED') ? 'matched_50ohm' : 'open'))
        errors.push(`campaign ${pathRecord.id}/${state.id} must partition all 24 cable-end conductors into 4 measured, 8 inactive, and 12 matched remaining ports`);
    }
  }

  const matrixObject = asObject(matrix);
  if (!sameArray(asArray(matrixObject.lanes), expectedLanes))
    errors.push('measurement matrix lane source is unexpectedly changed');
  if (!sameArray(asArray(matrixObject.requiredStates), expectedStateIds))
    errors.push('measurement matrix state source is unexpectedly changed');
  const states = asArray(safeDoc.measurementStates).map(asObject);
  if (states.length !== expectedStates.length ||
      !states.every((state, index) => sameState(state, expectedStates[index])))
    errors.push('measurement states must exactly lock active branch, termination, plane, fixture, power, Hi-Z authority, and controls');
  unique(states.map((state) => state.id), 'measurement state IDs', errors);

  checkExactRecords(safeDoc.structureClasses, expectedStructureClasses,
    'structure classes and unresolved instance rules', errors);

  const control = asObject(safeDoc.controlAndPower);
  checkExactRecords(control.controls, expectedControls, 'safe mux controls', errors);
  if (control.allPathsDisabledByDefault !== true)
    errors.push('all paths must be disabled by default');
  checkExactRecords(control.controlStateMappings, expectedControlMappings,
    'control state mappings', errors);
  if (control.maxUncontrolledCurrentA !== null ||
      control.currentLimitStatus !== 'BLOCKED_ON_DEVICE_AND_BENCH_SUPPLY_REVIEW')
    errors.push('electrical current limits must remain explicitly blocked, not guessed');
  if (control.noHostPowerPath !== true) errors.push('RF-only coupon must have no host power path');

  const slots = asArray(safeDoc.componentSlots).map(asObject);
  const expectedSlots = [
    {id: 'MUX_4_PAIR_2_TO_1', function: 'FOUR_DIFFERENTIAL_CHANNEL_MUX', candidateMpn: 'TMUXHS4512IRETT', sourceRecord: 'ISSUE5_PARTS_EVIDENCE', evidenceState: 'BLOCKED', freezeStatus: 'PROVISIONAL_ONLY', footprintStatus: 'NOT_FROZEN', modelStatus: 'MISSING_PUBLIC_STATE_AND_REFERENCE_PLANE_MODEL', prototypeSourceStatus: 'BLOCKED'},
    {id: 'OPTIONAL_LANE_ESD', function: 'LOW_CAPACITANCE_TWO_LINE_ESD', candidateMpn: 'RClamp01012ZC.F', sourceRecord: 'ISSUE5_PARTS_EVIDENCE', evidenceState: 'BLOCKED', freezeStatus: 'DNP_COMPARISON_ONLY', footprintStatus: 'NOT_FROZEN', modelStatus: 'MISSING_PUBLIC_BROADBAND_MODEL', prototypeSourceStatus: 'PARTIAL'},
    {id: 'RF_LAUNCH', function: 'CALIBRATED_BOARD_EDGE_RF_LAUNCH', candidateMpns: ['SMA-J-P-H-ST-EM1', '901-10511-1'], sourceRecord: 'ISSUE5_PARTS_EVIDENCE', evidenceState: 'BLOCKED', freezeStatus: 'LAB_AND_STACKUP_SELECTION_REQUIRED', footprintStatus: 'NOT_FROZEN', modelStatus: 'MISSING_BOARD_SPECIFIC_BROADBAND_MODEL', prototypeSourceStatus: 'BLOCKED'},
  ];
  if (slots.length !== expectedSlots.length || !slots.every((slot, index) => {
    const expected = expectedSlots[index];
    const flattenedSlot = {...slot, candidateMpns: undefined};
    const flattenedExpected = {...expected, candidateMpns: undefined};
    return sameObject(flattenedSlot, flattenedExpected) &&
      sameArray(asArray(slot.candidateMpns), asArray(expected.candidateMpns));
  })) errors.push('component slots must exactly retain blocked issue-5 candidates and freeze semantics');
  checkPart(inventoryPart(parts, 'TMUXHS4512IRETT'), 'mux', 'PROPOSED_ONLY',
    'MUX_4_PAIR_2_TO_1', errors);
  checkPart(inventoryPart(parts, 'RClamp01012ZC.F'), 'optional_esd',
    'DNP_COMPARISON_CANDIDATE', 'OPTIONAL_LANE_ESD', errors);
  checkPart(inventoryPart(parts, 'SMA-J-P-H-ST-EM1'), 'rf_launch',
    'PROPOSED_LAUNCH_CANDIDATE', 'RF_LAUNCH', errors);
  checkPart(inventoryPart(parts, '901-10511-1'), 'rf_launch_alternative',
    'DNP_ALTERNATIVE', 'RF_LAUNCH', errors);

  const constraints = asObject(safeDoc.constraintContract);
  if (constraints.status !== 'BLOCKED_ON_ISSUE_5_AND_ISSUE_7' ||
      constraints.stackupSource !== 'TBD_FABRICATOR_RESPONSE' ||
      constraints.traceGeometry !== 'TBD_AFTER_FABRICATOR_STACKUP' ||
      Object.keys(asObject(constraints.numericChannelLimits)).length !== 0 ||
      constraints.layoutGenerationAuthorized !== false ||
      constraints.footprintGenerationAuthorized !== false)
    errors.push('constraint contract must retain blocked stack-up, geometry, limits, layout, and footprint status');
  const reviewInputs = asObject(safeDoc.reviewInputs);
  for (const [field, expected] of Object.entries(expectedReviewInputs))
    if (!sameArray(asArray(reviewInputs[field]), expected))
      errors.push(`review input gate ${field} must exactly retain every blocked or unclaimed boundary`);
  if (!asArray(asObject(prototype).ports).every((port) =>
    ['HOST_A', 'COMMON', 'HOST_B'].includes(asObject(port).branch)))
    errors.push('channel-budget reference has an unexpected branch');
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = validateDocument(readJson('design/pcb1a/topology.contract.json'));
  if (errors.length) {
    console.error(`PCB-1A topology validation failed (${errors.length})`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('PCB-1A topology contract validated: 4 lanes, 24 RF ports, 8 paths, 6 states, 4 fixture classes, 4+8+12 campaign rule; PROPOSED/order-ready=false.');
}
