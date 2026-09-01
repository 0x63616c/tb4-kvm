import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..');
const plan = JSON.parse(
  fs.readFileSync(
    path.join(root, 'design/pcb1a-measurement-matrix.json'),
    'utf8',
  ),
);
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function includesEvery(values, required, field) {
  check(Array.isArray(values), `${field} must be an array`);
  for (const value of required) {
    check(values?.includes(value), `${field} lacks ${value}`);
  }
}

check(plan.schemaVersion === 1, 'unsupported PCB-1A plan schema');
check(plan.status === 'PROPOSED_UNBOOKED', 'lab status must remain explicit');
check(plan.orderReady === false, 'unbooked PCB-1A must not be order-ready');
check(
  plan.usb4OrThunderboltComplianceClaimAuthorized === false,
  'measurement coupon cannot authorize a USB4/TB compliance claim',
);
check(
  plan.instrument.minimumSingleEndedPorts >= 4,
  'mixed-mode path measurement requires at least four single-ended ports',
);
check(
  plan.instrument.preferredSingleEndedPorts >= 8,
  'pairwise crosstalk campaign should prefer at least eight ports',
);
check(
  plan.instrument.minimumStopFrequencyHz >= 20_000_000_000,
  'minimum VNA stop frequency must reach 20 GHz',
);
check(
  plan.instrument.preferredStopFrequencyHz >= 26_500_000_000,
  'preferred VNA stop frequency must reach 26.5 GHz',
);
check(
  plan.instrument.minimumPoints >= 1601,
  'frequency sweep must retain enough points for useful transforms',
);
check(
  plan.instrument.calibration === 'FULL_4_PORT_SOLT_OR_ECAL_AT_CABLE_ENDS',
  'full four-port cable-end calibration is required',
);
check(plan.instrument.labStatus === 'UNBOOKED', 'unknown lab booking state');
check(
  plan.referencePlanes.deembedded === 'PCB_PACKAGE_LANDS' &&
    plan.referencePlanes.siliconDieClaimed === false,
  'de-embedding must stop at package lands and not claim die planes',
);
includesEvery(plan.lanes, ['D0', 'D1', 'D2', 'D3'], 'lanes');
includesEvery(
  plan.requiredStructures,
  [
    'FIXTURE_DUT_FIX',
    'SYMMETRIC_2X_THRU_PER_DISTINCT_LAUNCH',
    'PLAIN_NO_MUX_THRU',
    'INACTIVE_PORT_TERMINATION_FIXTURE',
  ],
  'requiredStructures',
);
includesEvery(
  plan.requiredStates,
  [
    'UNPOWERED',
    'POWERED_ALL_PATHS_HIZ',
    'A_SELECTED_B_MATCHED',
    'B_SELECTED_A_MATCHED',
    'A_SELECTED_B_OPEN',
    'B_SELECTED_A_OPEN',
  ],
  'requiredStates',
);
includesEvery(
  plan.requiredMeasurements,
  [
    'SDD21_SDD12_INSERTION_LOSS',
    'SDD11_SDD22_RETURN_LOSS',
    'GROUP_DELAY',
    'SDC_SCD_MODE_CONVERSION',
    'COMMON_MODE_TERMS',
    'INACTIVE_PATH_ISOLATION',
    'PAIRWISE_NEXT_FEXT',
    'PHASE_DELAY_AND_LANE_SKEW',
    'RECONNECTION_REPEATABILITY',
    'SYSTEM_NOISE_FLOOR',
  ],
  'requiredMeasurements',
);
includesEvery(
  plan.deembedding.validation,
  [
    'RESIDUAL_THRU',
    'RAW_VS_DEEMBEDDED_COMPARISON',
    'RECIPROCITY',
    'PASSIVITY',
    'CAUSALITY',
    'TIME_DOMAIN_IMPEDANCE_CONTINUITY',
  ],
  'deembedding.validation',
);
includesEvery(
  plan.rawEvidence,
  [
    'RAW_SINGLE_ENDED_TOUCHSTONE',
    'RAW_2X_THRU_TOUCHSTONE',
    'RAW_PLAIN_THRU_TOUCHSTONE',
    'EXTRACTED_FIXTURE_TOUCHSTONE',
    'DEEMBEDDED_TOUCHSTONE',
    'MIXED_MODE_TOUCHSTONE',
    'CALIBRATION_AND_INSTRUMENT_MANIFEST',
    'PORT_POLARITY_AND_TERMINATION_MAP',
    'MUX_STATE_SUPPLY_AND_TEMPERATURE_LOG',
    'NOISE_FLOOR_AND_REPEATABILITY_CAPTURE',
    'BOARD_SERIAL_AND_FILE_HASH_MANIFEST',
  ],
  'rawEvidence',
);
check(
  plan.limits.status === 'BLOCKED_ON_END_TO_END_CHANNEL_BUDGET',
  'numeric limits must remain blocked until the channel budget exists',
);
check(
  Object.keys(plan.limits.numericLimits).length === 0,
  'do not invent numeric limits before the channel budget exists',
);
check(
  plan.limits.measurementValidityPassAuthorized === false,
  'measurement-validity pass must remain unauthorized before lab acceptance',
);
const metrology = plan.limits.metrologyValidity;
check(
  metrology?.status === 'BLOCKED_ON_LAB_ACCEPTANCE_CRITERIA' &&
    metrology?.separateFromProductAcceptance === true,
  'metrology validity must remain blocked and separate from product acceptance',
);
check(
  metrology?.validatedFrequencyBandHz === null,
  'do not invent the validated frequency band before lab review',
);
check(
  metrology?.fixtureElectricalRequirements?.standard ===
    'IEEE_370_2020_WITH_ERRATA' &&
    metrology?.fixtureElectricalRequirements?.requiredResult === 'PASS' &&
    metrology?.fixtureElectricalRequirements?.result === null,
  'IEEE 370 fixture electrical requirements must pass but are not pre-claimed',
);
check(
  metrology?.residualSelfDeembedding?.maximumAbsoluteInsertionLossResidualDb ===
    0.1 &&
    metrology?.residualSelfDeembedding?.maximumAbsolutePhaseResidualDeg === 1 &&
    metrology?.residualSelfDeembedding?.requireEveryPointInValidatedBand ===
      true,
  'retain proposed IEEE 370 residual self-de-embedding checks',
);
includesEvery(
  metrology?.residualSelfDeembedding?.terms,
  ['S21', 'S12'],
  'limits.metrologyValidity.residualSelfDeembedding.terms',
);
check(
  metrology?.uncertainty?.coverageFactorK === 2 &&
    metrology?.uncertainty?.requiredPerObservableAndFrequency === true,
  'a per-observable, per-frequency k=2 uncertainty model is required',
);
includesEvery(
  metrology?.uncertainty?.requiredContributors,
  [
    'CALIBRATION',
    'INSTRUMENT_DRIFT',
    'CABLE_STABILITY',
    'CONNECTOR_REMATE',
    'TERMINATION',
    'DEEMBEDDING',
    'NOISE_FLOOR',
  ],
  'limits.metrologyValidity.uncertainty.requiredContributors',
);
check(
  metrology?.repeatability?.minimumIndependentRemates >= 3 &&
    metrology?.repeatability?.acceptance ===
      'PAIRWISE_DELTA_LE_COMBINED_EXPANDED_UNCERTAINTY_K2' &&
    metrology?.repeatability?.absoluteMagnitudeCapDb === null &&
    metrology?.repeatability?.absolutePhaseCapDeg === null,
  'repeatability needs three remates and lab-defined absolute caps',
);
check(
  metrology?.noiseFloor?.minimumObservableMarginDb === 10 &&
    metrology?.noiseFloor?.status === 'PROVISIONAL_REQUIRES_LAB_ACCEPTANCE',
  'retain provisional noise margin and unresolved lab quality criteria',
);
includesEvery(
  metrology?.noiseFloor?.appliesTo,
  ['INACTIVE_PATH_ISOLATION', 'PAIRWISE_NEXT_FEXT'],
  'limits.metrologyValidity.noiseFloor.appliesTo',
);
includesEvery(
  metrology?.openTbd,
  [
    'VALIDATED_FREQUENCY_BAND',
    'ABSOLUTE_REPEATABILITY_CAPS',
    'FD_QUALITY_METRIC_ACCEPTANCE',
    'TD_QUALITY_METRIC_INPUTS_AND_ACCEPTANCE',
    'RESONANCE_DETECTION_RULE',
  ],
  'limits.metrologyValidity.openTbd',
);
check(
  metrology?.uncertainty?.absoluteMagnitudeCapDb === null &&
    metrology?.uncertainty?.absolutePhaseCapDeg === null &&
    Object.keys(metrology?.qualityMetrics ?? {}).length === 5 &&
    Object.values(metrology?.qualityMetrics ?? {}).every(
      (value) => value === null,
    ) &&
    Object.keys(metrology?.resonanceDetection ?? {}).length === 3 &&
    Object.values(metrology?.resonanceDetection ?? {}).every(
      (value) => value === null,
    ),
  'unaccepted uncertainty, quality and resonance criteria must remain null',
);
includesEvery(
  plan.limits.measurementValidityOnly,
  [
    'LAB_ACCEPTS_METROLOGY_CRITERIA_AND_VALIDATED_BAND',
    'CALIBRATION_AND_DEEMBEDDING_PASS_ACCEPTED_CRITERIA',
    'REPEATABILITY_WITHIN_K2_EXPANDED_UNCERTAINTY',
    'NOISE_FLOOR_MARGIN_PASSES_ACCEPTED_CRITERIA',
    'NO_UNEXPLAINED_RESONANCE_OR_STATE_ASYMMETRY',
    'RAW_EVIDENCE_COMPLETE',
  ],
  'limits.measurementValidityOnly',
);

if (failures.length) {
  console.error(`PCB-1A plan verification failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `PCB-1A plan verified: ${plan.lanes.length} lanes, ${plan.requiredStates.length} states, ${plan.instrument.minimumSingleEndedPorts}-port/${plan.instrument.minimumStopFrequencyHz / 1e9} GHz minimum; order-ready=${plan.orderReady}.`,
);
