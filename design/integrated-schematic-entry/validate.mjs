import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';

const directory = path.resolve(import.meta.dirname);
const root = path.resolve(directory, '..', '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
const readRoot = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const exact = (actual, expected) => JSON.stringify(actual) === JSON.stringify(expected);
const asArray = (value) => Array.isArray(value) ? value : [];

const expectedDomains = [
  {id:'UPSTREAM_A',role:'HOST',ownedSignals:['CC','PD','VBUS','VCONN'],sharesCcOrVbusWith:[]},
  {id:'UPSTREAM_B',role:'HOST',ownedSignals:['CC','PD','VBUS','VCONN'],sharesCcOrVbusWith:[]},
  {id:'DOWNSTREAM_DOCK',role:'DOCK',ownedSignals:['CC','PD','VBUS','VCONN'],sharesCcOrVbusWith:[]},
];
const expectedSheets = ['UPSTREAM_A_PD_POWER','UPSTREAM_B_PD_POWER','HS_USB2_SBU_SELECT','TB4_ROUTER','DOWNSTREAM_PD_POWER','SYSTEM_POWER','MCU_UI'];
const expectedInvariants = ['HOST_A_VBUS_NEVER_JOINS_HOST_B_VBUS','HOST_A_CC_NEVER_JOINS_HOST_B_CC','THREE_TYPE_C_DOMAINS_REMAIN_INDEPENDENT','BREAK_BEFORE_MAKE_FOR_SIGNAL_AND_HOST_POWER','PD_AND_POWER_PROTECTION_OUTRANK_MCU','MCU_NEVER_INTERCEPTS_20GBPS_LANES','ALL_CONNECTOR_ORIENTATIONS_REQUIRE_TEST','SHELL_AND_SIGNAL_GROUND_REVIEWED_SEPARATELY'];
const expectedGates = ['GATE-INT-001','GATE-DS-001','GATE-PD-001','GATE-SI-001','GATE-FAB-001','GATE-PCB1-PARTS-001','GATE-PCB1-BUDGET-001','GATE-COLLATERAL-ADOPTION-001'];
const expectedSources = ['docs/DESIGN-READINESS-CHECKLIST.md','docs/SIGNAL-POWER-OWNERSHIP.md','docs/research/issue-19-controller-route/README.md','evidence/ledger.json'];
const expectedPrototypeBlockers = ['GATE-INT-001','GATE-DS-001','GATE-PD-001','GATE-FAB-001','GATE-PCB1-PARTS-001','GATE-PCB1-BUDGET-001'];
const expectedControlledFacts = [
  {id:'ROUTER_IDENTITY',issueIds:[19],gateIds:['GATE-INT-001'],candidateIdentities:['Intel JHL8440','Intel JHL9440'],selectedCandidate:null,collateralClass:'REGISTRATION_GATED_OR_NDA_CONFIDENTIAL',permittedPublicMetadata:['public product identity','public lifecycle and ordering metadata','public source links'],requiredSourceRevision:'CURRENT_INTEL_REFERENCE_DESIGN_REVISION',requiredReviewTestModel:['independent electrical review','reference topology review','authorized bring-up/recovery review'],blockedAcceptance:{sourceRevision:null,review:null,test:null,model:null}},
  {id:'PD_DOMAIN_IMPLEMENTATION',issueIds:[19,20,21],gateIds:['GATE-INT-001','GATE-DS-001','GATE-PD-001'],candidateIdentities:['Infineon CYPD5235','Infineon CYPD5236'],selectedCandidate:null,collateralClass:'PUBLIC_LINK_ONLY_PLUS_GATED_REFERENCE',permittedPublicMetadata:['public part identity','public datasheet revision','public product and tool links'],requiredSourceRevision:'CURRENT_CONTROLLER_MATCHED_PD_REFERENCE_REVISION',requiredReviewTestModel:['independent PD/power review','all-role fault test plan','orientation model'],blockedAcceptance:{sourceRevision:null,review:null,test:null,model:null}},
  {id:'POWER_PROTECTION_TOPOLOGY',issueIds:[20,21],gateIds:['GATE-DS-001','GATE-PD-001'],candidateIdentities:[],selectedCandidate:null,collateralClass:'GATED_REFERENCE_AND_PROJECT_DERIVED_REVIEW',permittedPublicMetadata:['gate identity','safe-state requirements','public source links'],requiredSourceRevision:'ACCEPTED_REFERENCE_POWER_AND_FAULT_ANALYSIS_REVISION',requiredReviewTestModel:['independent power safety review','injected fault test','transition state model'],blockedAcceptance:{sourceRevision:null,review:null,test:null,model:null}},
  {id:'HIGH_SPEED_CHANNEL',issueIds:[5,6,7,8,34],gateIds:['GATE-SI-001','GATE-FAB-001','GATE-PCB1-PARTS-001','GATE-PCB1-BUDGET-001'],candidateIdentities:['router-reference-approved high-speed mux'],selectedCandidate:null,collateralClass:'PUBLIC_LINK_ONLY_PLUS_GATED_MODELS',permittedPublicMetadata:['candidate function','public product links','measurement contract links'],requiredSourceRevision:'FROZEN_STACKUP_AND_REFERENCE_APPROVED_CHANNEL_MODEL_REVISION',requiredReviewTestModel:['independent SI review','end-to-end channel simulation','reference-plane-specific measurement model'],blockedAcceptance:{sourceRevision:null,review:null,test:null,model:null}},
  {id:'FIRMWARE_NVM_RECOVERY',issueIds:[19],gateIds:['GATE-INT-001'],candidateIdentities:[],selectedCandidate:null,collateralClass:'NDA_CONFIDENTIAL_OR_RELEASE_PARTY_CONTROLLED',permittedPublicMetadata:['document title','revision/date','access restriction','redistribution classification'],requiredSourceRevision:'AUTHORIZED_FIRMWARE_NVM_AND_RECOVERY_PACKAGE_REVISION',requiredReviewTestModel:['independent recovery review','program-readback-rollback test','supported toolchain verification'],blockedAcceptance:{sourceRevision:null,review:null,test:null,model:null}},
  {id:'COLLATERAL_REDISTRIBUTION',issueIds:[19,22],gateIds:['GATE-COLLATERAL-ADOPTION-001','GATE-INT-001'],candidateIdentities:[],selectedCandidate:null,collateralClass:'CLASSIFICATION_PENDING_OWNER_ADOPTION',permittedPublicMetadata:['title','revision/date','access restriction','entitlement owner','permitted hash metadata'],requiredSourceRevision:'WRITTEN_REDISTRIBUTION_TERMS_REVISION',requiredReviewTestModel:['independent collateral review','redistribution policy validation','release-boundary review'],blockedAcceptance:{sourceRevision:null,review:null,test:null,model:null}},
];

export function validateDocument(document, references = {}) {
  const errors = [];
  let ledger;
  try {
    const schema = references.schema ?? read('schema.json');
    const ajv = new Ajv2020({allErrors:true, strict:true});
    const validate = ajv.compile(schema);
    if (!validate(document)) errors.push(...(validate.errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message}`));
  } catch (error) { errors.push(`schema must be readable and valid: ${error.message}`); }
  try { ledger = references.ledger ?? readRoot('evidence/ledger.json'); }
  catch (error) { errors.push(`evidence ledger must be readable: ${error.message}`); ledger = {}; }
  const doc = document && typeof document === 'object' && !Array.isArray(document) ? document : {};
  if (doc.status !== 'PROPOSED') errors.push('status must remain PROPOSED');
  if (doc.captureAuthorized !== false) errors.push('captureAuthorized must remain false');
  if (doc.orderReady !== false) errors.push('orderReady must remain false');
  if (!exact(doc.sourceContracts, expectedSources)) errors.push('source contracts must exactly preserve the governing records');
  if (!exact(doc.portDomains, expectedDomains)) errors.push('exactly three independent Type-C domains are required; CC/VBUS may not join');
  if (!exact(doc.futureSheets, expectedSheets)) errors.push('exactly seven future schematic sheets are required');
  if (!exact(doc.safetyInvariants, expectedInvariants)) errors.push('safety invariants must exactly preserve host isolation and sequencing');
  if (!exact(asArray(doc.integratedGates).map((gate) => gate?.id), expectedGates) || !asArray(doc.integratedGates).every((gate) => gate?.status === 'BLOCKED')) errors.push('all integrated gates must remain BLOCKED');
  if (!exact(doc.controlledFacts, expectedControlledFacts)) errors.push('controlled facts must exactly match the canonical issue/gate/candidate/collateral/revision/evidence mapping');
  const records = asArray(ledger?.records);
  for (const gateId of expectedGates) {
    const gate = records.find((record) => record?.id === gateId);
    if (gate?.kind !== 'gate' || gate?.status !== 'BLOCKED') errors.push(`evidence ledger gate ${gateId} must exist and remain BLOCKED`);
  }
  const prototype = records.find((record) => record?.id === 'ART-INT-PROTOTYPE-001');
  if (prototype?.kind !== 'artifact' || prototype?.status !== 'BLOCKED') errors.push('evidence ledger ART-INT-PROTOTYPE-001 must exist and remain BLOCKED');
  if (!expectedPrototypeBlockers.every((gateId) => asArray(prototype?.blockers).includes(gateId))) errors.push('evidence ledger ART-INT-PROTOTYPE-001 must include the relevant integrated blockers');
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const input = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : read('contract.json');
  const failures = validateDocument(input);
  if (failures.length) { console.error(`Integrated schematic-entry validation failed (${failures.length})`); failures.forEach((failure) => console.error(`- ${failure}`)); process.exit(1); }
  console.log('Integrated schematic-entry contract validated: 3 domains, 7 sheets, 8 blocked gates, and 6 unaccepted controlled facts.');
}
