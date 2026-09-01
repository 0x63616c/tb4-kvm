import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const directory = path.dirname(new URL(import.meta.url).pathname);
const catalogPath = process.argv[2] || path.join(directory, 'catalog.json');
const responsePath =
  process.argv[3] || path.join(directory, 'response.example.json');
const schema = JSON.parse(
  fs.readFileSync(path.join(directory, 'response.schema.json'), 'utf8'),
);
const parsedCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const parsedResponse = JSON.parse(fs.readFileSync(responsePath, 'utf8'));
const catalog =
  parsedCatalog &&
  typeof parsedCatalog === 'object' &&
  !Array.isArray(parsedCatalog)
    ? parsedCatalog
    : {};
const response =
  parsedResponse &&
  typeof parsedResponse === 'object' &&
  !Array.isArray(parsedResponse)
    ? parsedResponse
    : {};
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const valid = ajv.validate(schema, response);
const failures = valid
  ? []
  : ajv.errors.map((error) => `${error.instancePath || '/'} ${error.message}`);
const expectedIds = [
  'startup',
  'charging',
  'failover',
  'compatibility',
  'power-loss',
  'switching',
  'status',
  'mechanical-envelope',
];
const ownerAcknowledgement =
  schema.$defs.ownerAcceptance.properties.acknowledgement.anyOf[1].const;
const catalogDecisions = Array.isArray(catalog.decisions)
  ? catalog.decisions
  : [];
const responseAnswers = Array.isArray(response.answers) ? response.answers : [];
const responseNotes = typeof response.notes === 'string' ? response.notes : '';

if (
  catalog.schemaVersion !== 1 ||
  catalog.issue !== 3 ||
  catalog.status !== 'DRAFT' ||
  !Array.isArray(catalog.decisions)
)
  failures.push('/catalog: must be the DRAFT catalog for issue #3');
const ids = catalogDecisions.map((decision) => decision?.id);
if (
  ids.length !== expectedIds.length ||
  new Set(ids).size !== ids.length ||
  expectedIds.some((id) => !ids.includes(id))
)
  failures.push(
    '/catalog/decisions: require the eight current decision IDs exactly once',
  );
for (const decision of catalogDecisions) {
  if (
    !decision ||
    !decision.id ||
    !decision.title ||
    !decision.question ||
    !decision.rationale ||
    !decision.boundary ||
    !Array.isArray(decision.options) ||
    !decision.options.length
  )
    failures.push(
      `/catalog/decisions/${decision?.id || '?'}: incomplete decision`,
    );
  if (!decision || !Array.isArray(decision.options)) continue;
  const optionValues = decision.options.map((option) => option?.value);
  if (!optionValues.includes(decision.defaultValue))
    failures.push(
      `/catalog/decisions/${decision.id}: defaultValue must be an allowed option`,
    );
  if (new Set(optionValues).size !== optionValues.length)
    failures.push(
      `/catalog/decisions/${decision.id}: option values must be unique`,
    );
  for (const option of decision.options) {
    const mustRequireNotes =
      option?.value === 'other' ||
      (decision.id === 'charging' && option?.value === 'lower-target');
    if (mustRequireNotes && option.requiresNotes !== true)
      failures.push(
        `/catalog/decisions/${decision.id}/options/${option?.value || '?'}: requiresNotes must be true`,
      );
  }
}

const answerIds = responseAnswers.map((answer) => answer?.decisionId);
if (
  answerIds.length !== ids.length ||
  new Set(answerIds).size !== answerIds.length ||
  ids.some((id) => !answerIds.includes(id))
)
  failures.push('/answers: must cover every catalog decision exactly once');
for (const answer of responseAnswers) {
  const decision = catalogDecisions.find(
    (candidate) => candidate?.id === answer?.decisionId,
  );
  if (
    !decision ||
    !decision.options.some((option) => option?.value === answer?.value)
  )
    failures.push(
      `/answers/${answer?.decisionId || '?'}: value must be an allowed catalog option`,
    );
}

const requiresNotes = responseAnswers.some((answer) => {
  const decision = catalogDecisions.find(
    (candidate) => candidate?.id === answer?.decisionId,
  );
  return (
    decision?.options.find((option) => option?.value === answer?.value)
      ?.requiresNotes === true
  );
});
if (requiresNotes && !responseNotes.trim())
  failures.push('/notes: a selected option requires a nonblank explanation');

const acceptance =
  response.ownerAcceptance && typeof response.ownerAcceptance === 'object'
    ? response.ownerAcceptance
    : {};
const emptyAcceptance = [
  acceptance.owner,
  acceptance.date,
  acceptance.evidence,
  acceptance.acknowledgement,
].every((value) => value === null);
if (response.responseStatus === 'DRAFT' && !emptyAcceptance)
  failures.push(
    '/ownerAcceptance: DRAFT cannot carry acceptance identity, date, evidence, or acknowledgement',
  );
if (
  response.responseStatus === 'OWNER_ACCEPTED' &&
  (!acceptance.owner?.trim() ||
    !acceptance.date ||
    !acceptance.evidence?.trim() ||
    acceptance.acknowledgement !== ownerAcknowledgement)
)
  failures.push(
    '/ownerAcceptance: OWNER_ACCEPTED requires nonblank owner, ISO date, evidence reference, and acknowledgement',
  );

if (failures.length) {
  console.error(`Product decision validation failed (${failures.length})`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(
  `Product decisions validated: ${catalogDecisions.length} catalog decisions and ${responseAnswers.length} DRAFT/accepted answers`,
);
