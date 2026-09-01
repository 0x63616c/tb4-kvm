import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';

const dir = path.resolve(import.meta.dirname);
const read = (file) =>
  JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
const schema = read('schema.json');
const prototype = read('prototype-a-example.json');
const synthetic = read('test-only-closed-fixture.json');
const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  allowUnionTypes: true,
});
const validateSchema = ajv.compile(schema);
const epsilon = 1e-9;

function unique(values, label, errors) {
  if (new Set(values).size !== values.length)
    errors.push(`${label} must be unique`);
}
function equal(a, b) {
  return Math.abs(a - b) <= epsilon;
}
function ids(values) {
  return new Set(values.map((value) => value.id));
}
function exactArray(actual, expected) {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}
function domainUnit(domain) {
  return domain.endsWith('_PS') ? 'ps' : 'dB';
}
function expectedObservable(domain) {
  return {
    INSERTION_LOSS_DB: ['PER_SCENARIO', 'MAXIMUM'],
    RETURN_LOSS_DB: ['PER_SCENARIO', 'MINIMUM'],
    COUPLING_DB: ['PER_SCENARIO', 'MAXIMUM'],
    GROUP_DELAY_PS: ['PER_SCENARIO', 'MAXIMUM'],
    LANE_SKEW_PS: ['COUPLED_LANE_SET', 'MAXIMUM'],
  }[domain];
}
function branchForState(state) {
  return state.startsWith('A_SELECTED') ? 'HOST_A' : 'HOST_B';
}
function inactiveBranchForState(state) {
  return state.startsWith('A_SELECTED') ? 'HOST_B' : 'HOST_A';
}
function portLane(port) {
  return port?.pairId.slice(0, 2);
}
function isPositiveSemidefinite(matrix) {
  const work = matrix.map((row) => [...row]);
  const size = work.length;
  for (let iteration = 0; iteration < size * size * 16; iteration += 1) {
    let largest = 0;
    let row = 0;
    let column = 1;
    for (let left = 0; left < size; left += 1)
      for (let right = left + 1; right < size; right += 1)
        if (Math.abs(work[left][right]) > largest) {
          largest = Math.abs(work[left][right]);
          row = left;
          column = right;
        }
    if (largest <= epsilon) break;
    const angle =
      0.5 *
      Math.atan2(2 * work[row][column], work[column][column] - work[row][row]);
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const leftDiagonal = work[row][row];
    const rightDiagonal = work[column][column];
    const offDiagonal = work[row][column];
    work[row][row] =
      cosine ** 2 * leftDiagonal -
      2 * sine * cosine * offDiagonal +
      sine ** 2 * rightDiagonal;
    work[column][column] =
      sine ** 2 * leftDiagonal +
      2 * sine * cosine * offDiagonal +
      cosine ** 2 * rightDiagonal;
    work[row][column] = 0;
    work[column][row] = 0;
    for (let index = 0; index < size; index += 1) {
      if (index === row || index === column) continue;
      const left = work[index][row];
      const right = work[index][column];
      work[index][row] = work[row][index] = cosine * left - sine * right;
      work[index][column] = work[column][index] = sine * left + cosine * right;
    }
  }
  return work.every((row, index) => row[index] >= -epsilon);
}
function semanticErrors(doc) {
  const errors = [];
  for (const [label, values] of [
    ['plane IDs', doc.planes],
    ['port IDs', doc.ports],
    ['structure IDs', doc.structures],
    ['termination network IDs', doc.terminationNetworks],
    ['evidence IDs', doc.authoritativeEvidence],
    ['scenario IDs', doc.scenarios],
    ['coupled lane-set IDs', doc.coupledLaneSets],
    ['observable IDs', doc.observables],
    ['term IDs', doc.terms],
  ])
    unique(
      values.map((value) => value.id),
      label,
      errors,
    );

  if (!(doc.frequency.sweepStartHz < doc.frequency.sweepStopHz))
    errors.push('frequency sweep must be ordered');
  const [bandStart, bandStop] = doc.frequency.validatedBandHz;
  if (
    !(
      bandStart <= bandStop &&
      bandStart >= doc.frequency.sweepStartHz &&
      bandStop <= doc.frequency.sweepStopHz
    )
  )
    errors.push('validated band must be ordered and within sweep');
  for (let index = 0; index < doc.frequency.sampleHz.length; index += 1) {
    const value = doc.frequency.sampleHz[index];
    if (
      !(
        value >= doc.frequency.sweepStartHz &&
        value <= doc.frequency.sweepStopHz
      )
    )
      errors.push('frequency sample outside sweep');
    if (index && !(doc.frequency.sampleHz[index - 1] < value))
      errors.push('frequency samples must be strictly increasing');
  }
  if (
    !doc.frequency.sampleHz.some(
      (value) => value >= bandStart && value <= bandStop,
    )
  )
    errors.push(
      'at least one frequency sample must be within the validated band',
    );

  const portIds = ids(doc.ports);
  const ports = new Map(doc.ports.map((port) => [port.id, port]));
  const planeIds = ids(doc.planes);
  for (const port of doc.ports)
    if (!planeIds.has(port.planeId))
      errors.push(`port ${port.id} references unknown plane`);
  unique(
    doc.ports.map((port) => port.singleEndedNumber),
    'single-ended port numbers',
    errors,
  );
  const pairs = new Map();
  for (const port of doc.ports) {
    pairs.set(port.pairId, [...(pairs.get(port.pairId) ?? []), port]);
  }
  for (const [pairId, pair] of pairs) {
    if (
      pair.length !== 2 ||
      new Set(pair.map((port) => port.polarity)).size !== 2
    )
      errors.push(`pair ${pairId} must have one P and one N port`);
  }
  if (
    !exactArray(
      doc.mixedMode.order,
      doc.ports.map((port) => port.id),
    )
  )
    errors.push(
      'mixed-mode order must list every port exactly once in machine-readable port order',
    );
  for (let index = 0; index < doc.mixedMode.order.length; index += 2) {
    const first = doc.ports.find(
      (port) => port.id === doc.mixedMode.order[index],
    );
    const second = doc.ports.find(
      (port) => port.id === doc.mixedMode.order[index + 1],
    );
    if (
      !first ||
      !second ||
      first.pairId !== second.pairId ||
      first.polarity !== 'P' ||
      second.polarity !== 'N'
    )
      errors.push('mixed-mode order must retain P,N pair ordering');
  }

  const structures = new Map(doc.structures.map((value) => [value.id, value]));
  const networks = new Map(
    doc.terminationNetworks.map((value) => [value.id, value]),
  );
  const evidence = new Map(
    doc.authoritativeEvidence.map((value) => [value.id, value]),
  );
  for (const network of doc.terminationNetworks) {
    if (!planeIds.has(network.planeId))
      errors.push(`termination network ${network.id} references unknown plane`);
    unique(
      network.perPort.map((value) => value.portId),
      `termination network ${network.id} ports`,
      errors,
    );
    if (
      !exactArray(
        network.perPort
          .map((value) => value.portId)
          .sort((a, b) => a.localeCompare(b)),
        [...portIds].sort((a, b) => a.localeCompare(b)),
      )
    )
      errors.push(`termination network ${network.id} must map every port`);
    if (
      network.perPort.some(
        (value) => ports.get(value.portId)?.planeId !== network.planeId,
      )
    )
      errors.push(
        `termination network ${network.id} must map ports at its declared plane`,
      );
  }

  const scenarios = new Map(doc.scenarios.map((value) => [value.id, value]));
  for (const scenario of doc.scenarios) {
    const structure = structures.get(scenario.fixtureStructureId);
    const network = networks.get(scenario.terminationNetworkId);
    if (!structure)
      errors.push(`scenario ${scenario.id} references unknown structure`);
    if (!network)
      errors.push(
        `scenario ${scenario.id} references unknown termination network`,
      );
    if (
      scenario.applicability === 'EXCLUDED' &&
      !scenario.exclusionReason.trim()
    )
      errors.push(`excluded scenario ${scenario.id} requires a reason`);
    if (
      scenario.applicability === 'APPLIES' &&
      structure?.kind !== 'DUT_FIXTURE'
    )
      errors.push(
        `applicable scenario ${scenario.id} must use DUT fixture, not comparator`,
      );
    const expectedInactive = scenario.dutState.endsWith('_MATCHED')
      ? 'matched_50ohm'
      : scenario.dutState.endsWith('_OPEN')
        ? 'open'
        : scenario.dutState.includes('HIZ')
          ? 'HiZ'
          : 'not_applicable';
    if (scenario.inactiveTermination !== expectedInactive)
      errors.push(
        `scenario ${scenario.id} contradicts state and inactive termination`,
      );
    if (
      scenario.dutState === 'UNPOWERED' &&
      scenario.powerState !== 'unpowered'
    )
      errors.push(`unpowered scenario ${scenario.id} has powered state`);
    if (
      scenario.dutState === 'POWERED_ALL_PATHS_HIZ' &&
      scenario.powerState !== 'powered'
    )
      errors.push(`powered Hi-Z scenario ${scenario.id} has unpowered state`);
    if (scenario.inactiveTermination === 'HiZ') {
      const authority = evidence.get(scenario.hiZAuthorityEvidenceId);
      if (!authority || authority.kind !== 'DATASHEET_OR_MODEL')
        errors.push(`Hi-Z scenario ${scenario.id} lacks authoritative support`);
    } else if (scenario.hiZAuthorityEvidenceId !== null)
      errors.push(
        `non-Hi-Z scenario ${scenario.id} must not declare Hi-Z authority`,
      );
    if (network && scenario.inactiveTermination !== 'not_applicable') {
      const inactivePair = doc.ports.filter(
        (port) =>
          port.branch === inactiveBranchForState(scenario.dutState) &&
          portLane(port) === scenario.lane,
      );
      const terminationByPort = new Map(
        network.perPort.map((mapping) => [mapping.portId, mapping.termination]),
      );
      if (
        inactivePair.length !== 2 ||
        new Set(inactivePair.map((port) => port.polarity)).size !== 2 ||
        inactivePair.some(
          (port) =>
            terminationByPort.get(port.id) !== scenario.inactiveTermination,
        )
      )
        errors.push(
          `scenario ${scenario.id} must apply its inactive termination to both P and N conductors at the declared network and plane`,
        );
    }
  }

  const observables = new Map(
    doc.observables.map((value) => [value.id, value]),
  );
  for (const observable of doc.observables) {
    const [scope, reducer] = expectedObservable(observable.domain);
    if (observable.scope !== scope || observable.reducer !== reducer)
      errors.push(
        `observable ${observable.id} has invalid domain, scope, or reducer`,
      );
    if (
      observable.domain === 'GROUP_DELAY_PS' &&
      !Number.isFinite(observable.targetPs)
    )
      errors.push(`group delay observable ${observable.id} requires targetPs`);
    if (
      observable.domain !== 'GROUP_DELAY_PS' &&
      observable.targetPs !== undefined
    )
      errors.push(`only group delay may declare targetPs`);
  }

  const laneSets = new Map(
    doc.coupledLaneSets.map((value) => [value.id, value]),
  );
  if (doc.status === 'CLOSED_FOR_PROTOTYPE_ALLOCATION') {
    for (const laneSet of doc.coupledLaneSets) {
      if (
        !exactArray(
          [...laneSet.lanes].sort((a, b) => a.localeCompare(b)),
          ['D0', 'D1', 'D2', 'D3'],
        ) ||
        new Set(laneSet.scenarioIds).size !== 4
      )
        errors.push(
          `coupled lane set ${laneSet.id} must contain four distinct lanes and scenarios`,
        );
      const setScenarios = laneSet.scenarioIds.map((id) => scenarios.get(id));
      if (
        setScenarios.some(
          (scenario) => !scenario || scenario.applicability !== 'APPLIES',
        )
      )
        errors.push(
          `coupled lane set ${laneSet.id} references unavailable scenario`,
        );
      else if (
        !exactArray(
          setScenarios
            .map((scenario) => scenario.lane)
            .sort((a, b) => a.localeCompare(b)),
          ['D0', 'D1', 'D2', 'D3'],
        )
      )
        errors.push(`coupled lane set ${laneSet.id} does not cover four lanes`);
    }
  }

  for (const term of doc.terms) {
    const observable = observables.get(term.observableId);
    if (!observable) {
      errors.push(`term ${term.id} references unknown observable`);
      continue;
    }
    if (
      (observable.scope === 'PER_SCENARIO') !== (term.scenarioId !== null) ||
      (observable.scope === 'COUPLED_LANE_SET') !==
        (term.coupledLaneSetId !== null)
    )
      errors.push(`term ${term.id} has wrong coverage scope`);
    if (term.scenarioId && !scenarios.has(term.scenarioId))
      errors.push(`term ${term.id} references unknown scenario`);
    if (term.coupledLaneSetId && !laneSets.has(term.coupledLaneSetId))
      errors.push(`term ${term.id} references unknown lane set`);
    if (
      term.scenarioId &&
      scenarios.get(term.scenarioId).applicability !== 'APPLIES'
    )
      errors.push(`term ${term.id} covers excluded scenario`);
    const path = term.measurementPath;
    const need = (keys) =>
      keys.every((key) => path[key] && portIds.has(path[key]));
    if (observable.domain === 'RETURN_LOSS_DB') {
      if (path.kind !== 'REFLECTION' || !need(['atPortId']))
        errors.push(
          `return-loss term ${term.id} needs a named reflection port`,
        );
    } else if (observable.domain === 'COUPLING_DB') {
      if (
        path.kind !== 'COUPLING' ||
        !need(['aggressorPortId', 'victimPortId']) ||
        path.aggressorPortId === path.victimPortId
      )
        errors.push(
          `coupling term ${term.id} needs distinct aggressor and victim ports`,
        );
    } else if (
      path.kind !== 'TRANSMISSION' ||
      !need(['fromPortId', 'toPortId']) ||
      path.fromPortId === path.toPortId
    )
      errors.push(`term ${term.id} needs distinct transmission endpoints`);
    const scenario = term.scenarioId ? scenarios.get(term.scenarioId) : null;
    const network = scenario
      ? networks.get(scenario.terminationNetworkId)
      : null;
    if (scenario && path.kind === 'TRANSMISSION') {
      const from = ports.get(path.fromPortId);
      const to = ports.get(path.toPortId);
      const selectedBranch = branchForState(scenario.dutState);
      const forward =
        from?.branch === selectedBranch &&
        to?.branch === 'COMMON' &&
        portLane(from) === scenario.lane &&
        portLane(to) === scenario.lane;
      const reverse =
        from?.branch === 'COMMON' &&
        to?.branch === selectedBranch &&
        portLane(from) === scenario.lane &&
        portLane(to) === scenario.lane;
      if (!(scenario.direction === 'forward' ? forward : reverse))
        errors.push(
          `term ${term.id} path does not bind to its scenario lane and selected branch`,
        );
    }
    if (scenario && path.kind === 'REFLECTION') {
      const port = ports.get(path.atPortId);
      if (
        portLane(port) !== scenario.lane ||
        ![branchForState(scenario.dutState), 'COMMON'].includes(port?.branch)
      )
        errors.push(
          `term ${term.id} reflection does not bind to its scenario lane and path role`,
        );
    }
    if (scenario && path.kind === 'COUPLING') {
      const aggressor = ports.get(path.aggressorPortId);
      const victim = ports.get(path.victimPortId);
      if (
        portLane(aggressor) !== scenario.lane ||
        aggressor?.branch !== branchForState(scenario.dutState) ||
        victim?.branch !== branchForState(scenario.dutState)
      )
        errors.push(
          `term ${term.id} coupling does not bind aggressor/victim roles to its scenario`,
        );
    }
    if (scenario && network) {
      const namedPortIds = Object.entries(path)
        .filter(([key, value]) => key !== 'kind' && typeof value === 'string')
        .map(([, value]) => value);
      const terminationByPort = new Map(
        network.perPort.map((mapping) => [mapping.portId, mapping.termination]),
      );
      const measurementPairPorts = namedPortIds.flatMap((portId) => {
        const port = ports.get(portId);
        return port ? (pairs.get(port.pairId) ?? []) : [];
      });
      if (
        measurementPairPorts.some(
          (port) => terminationByPort.get(port.id) !== 'measurement_port',
        )
      )
        errors.push(
          `term ${term.id} requires every named measurement endpoint and its P/N partner to be measurement_port`,
        );
    }
    if (
      observable.domain === 'LANE_SKEW_PS'
        ? term.role !== 'COUPLED_DERIVED'
        : term.role === 'COUPLED_DERIVED'
    )
      errors.push(`term ${term.id} has invalid aggregation role`);
    if (
      term.role === 'ALLOCATION_PENALTY' &&
      observable.domain !== 'INSERTION_LOSS_DB'
    )
      errors.push(`only insertion loss may use dB allocation penalties`);
    if (
      observable.domain === 'INSERTION_LOSS_DB' &&
      term.samples.some((sample) => sample.value < 0)
    )
      errors.push(`insertion-loss term ${term.id} cannot be negative`);
    if (
      observable.domain === 'RETURN_LOSS_DB' &&
      term.samples.some((sample) => sample.value < 0)
    )
      errors.push(`return-loss term ${term.id} must be positive`);
    if (
      !exactArray(
        term.samples.map((sample) => sample.frequencyHz),
        doc.frequency.sampleHz,
      )
    )
      errors.push(
        `term ${term.id} samples must be ordered, in sweep, and match declared frequency samples`,
      );
    checkUncertainty(term, observable, errors);
  }

  if (doc.status !== 'CLOSED_FOR_PROTOTYPE_ALLOCATION') return errors;
  const groupDelay = doc.observables.find(
    (observable) => observable.domain === 'GROUP_DELAY_PS',
  );
  for (const laneSet of doc.coupledLaneSets) {
    const setScenarios = laneSet.scenarioIds.map((id) => scenarios.get(id));
    if (setScenarios.some((scenario) => !scenario)) continue;
    const comparable = setScenarios.map((scenario) =>
      [
        scenario.direction,
        scenario.dutState,
        scenario.inactiveTermination,
        scenario.powerState,
        scenario.temperatureC,
        scenario.fixtureStructureId,
        scenario.terminationNetworkId,
      ].join('/'),
    );
    if (new Set(comparable).size !== 1)
      errors.push(
        `coupled lane set ${laneSet.id} must hold direction, state, termination, power, temperature, structure, and network constant`,
      );
    if (groupDelay) {
      const roles = setScenarios.map((scenario) => {
        const term = doc.terms.find(
          (value) =>
            value.observableId === groupDelay.id &&
            value.scenarioId === scenario.id,
        );
        if (!term) return 'MISSING';
        const path = term.measurementPath;
        return `${path.kind}:${ports.get(path.fromPortId)?.branch ?? ''}>${ports.get(path.toPortId)?.branch ?? ''}`;
      });
      if (new Set(roles).size !== 1 || roles[0] === 'MISSING')
        errors.push(
          `coupled lane set ${laneSet.id} must use identical group-delay path roles`,
        );
    }
  }
  if (doc.closure.tbdFields.length || !doc.closure.allocationPassAuthorized)
    errors.push(
      'closed allocation cannot contain TBD fields or missing authorization',
    );
  if (
    doc.claimBoundary.testOnly &&
    doc.closure.limits.some((limit) => limit.basis !== 'SYNTHETIC_TEST_ONLY')
  )
    errors.push('test-only fixture cannot assert product limits');
  if (
    !doc.claimBoundary.testOnly &&
    doc.closure.limits.some((limit) => limit.basis === 'SYNTHETIC_TEST_ONLY')
  )
    errors.push('production record cannot use synthetic limits');
  if (!doc.claimBoundary.testOnly) {
    if (
      doc.planes.some(
        (plane) =>
          plane.kind === 'TEST_ONLY' ||
          /TEST_ONLY|SYNTHETIC/i.test(`${plane.id} ${plane.description}`),
      )
    )
      errors.push(
        'production closure cannot use test-only or synthetic planes',
      );
    if (
      doc.authoritativeEvidence.some(
        (item) =>
          item.kind === 'TEST_ONLY' ||
          /TEST_ONLY|SYNTHETIC/i.test(`${item.id} ${item.description}`),
      )
    )
      errors.push(
        'production closure cannot use test-only or synthetic evidence',
      );
    for (const term of doc.terms) {
      const pathPortIds = Object.values(term.measurementPath).filter(
        (value) =>
          typeof value === 'string' && value !== term.measurementPath.kind,
      );
      if (
        pathPortIds.some(
          (portId) =>
            doc.planes.find((plane) => plane.id === ports.get(portId)?.planeId)
              ?.kind !== 'PCB_PACKAGE_LAND',
        )
      )
        errors.push(
          `production term ${term.id} must use PCB package-land allocation planes`,
        );
    }
  }
  const acceptedEvidence = new Set(doc.closure.acceptedEvidenceIds);
  unique(
    doc.closure.acceptedEvidenceIds,
    'closure accepted evidence IDs',
    errors,
  );
  for (const term of doc.terms) {
    if (
      ['D_ASSUMPTION', 'TBD'].includes(term.evidence.grade) ||
      !term.evidence.evidenceIds.length ||
      term.evidence.evidenceIds.some(
        (id) => !acceptedEvidence.has(id) || !evidence.has(id),
      )
    )
      errors.push(
        `closed term ${term.id} lacks accepted non-assumption evidence`,
      );
  }
  unique(doc.closure.requiredObservableIds, 'required observable IDs', errors);
  for (const id of doc.closure.requiredObservableIds)
    if (!observables.has(id))
      errors.push(`closure requires unknown observable ${id}`);
  const limits = new Map();
  for (const limit of doc.closure.limits) {
    const observable = observables.get(limit.observableId);
    const key = `${limit.observableId}/${limit.scenarioId ?? limit.coupledLaneSetId}`;
    if (limits.has(key)) errors.push(`duplicate closure limit ${key}`);
    limits.set(key, limit);
    if (
      !observable ||
      (observable.scope === 'PER_SCENARIO') !== (limit.scenarioId !== null) ||
      (observable.scope === 'COUPLED_LANE_SET') !==
        (limit.coupledLaneSetId !== null)
    )
      errors.push(`limit ${key} has wrong observable scope`);
  }
  const requiredGroups = [];
  for (const observableId of doc.closure.requiredObservableIds) {
    const observable = observables.get(observableId);
    if (observable.scope === 'PER_SCENARIO')
      for (const scenario of doc.scenarios.filter(
        (value) => value.applicability === 'APPLIES',
      ))
        requiredGroups.push([observable, scenario.id]);
    else
      for (const laneSet of doc.coupledLaneSets)
        requiredGroups.push([observable, laneSet.id]);
  }
  for (const [observable, scopeId] of requiredGroups) {
    const key = `${observable.id}/${scopeId}`;
    const groupTerms = doc.terms.filter(
      (term) =>
        term.observableId === observable.id &&
        (observable.scope === 'PER_SCENARIO'
          ? term.scenarioId === scopeId
          : term.coupledLaneSetId === scopeId),
    );
    if (!groupTerms.length) {
      errors.push(`required coverage missing for ${key}`);
      continue;
    }
    const limit = limits.get(key);
    if (!limit) {
      errors.push(`required limit missing for ${key}`);
      continue;
    }
    if (
      limit.worstFrequencyHz < bandStart ||
      limit.worstFrequencyHz > bandStop ||
      !doc.frequency.sampleHz.includes(limit.worstFrequencyHz)
    )
      errors.push(
        `closure ${key} must declare an in-band sampled worst frequency`,
      );
    const result = evaluateGroup(doc, observable, scopeId, groupTerms, errors);
    if (
      result &&
      (!equal(result.frequencyHz, limit.worstFrequencyHz) ||
        (observable.reducer === 'MAXIMUM'
          ? result.bound > limit.limit + epsilon
          : result.bound < limit.limit - epsilon))
    )
      errors.push(
        `closure ${key} has wrong reducer frequency, limit, or remaining margin`,
      );
  }
  if (limits.size !== requiredGroups.length)
    errors.push(
      'closure limits must exactly cover every required observable and applicable scenario',
    );
  return errors;
}

function checkUncertainty(term, observable, errors) {
  const model = term.uncertainty;
  unique(
    model.contributors.map((value) => value.id),
    `uncertainty contributors for ${term.id}`,
    errors,
  );
  if (
    model.contributors.some(
      (value) =>
        value.unit !== domainUnit(observable.domain) ||
        !Number.isFinite(value.standardUncertainty) ||
        !Number.isFinite(value.sensitivity),
    )
  )
    errors.push(
      `term ${term.id} uncertainty needs finite unit-aware contributors`,
    );
  const components = model.contributors.map(
    (value) => value.standardUncertainty * value.sensitivity,
  );
  let uc;
  if (model.combinationRule === 'INDEPENDENT_RSS') {
    if (model.contributors.some((value) => value.sharing !== 'INDEPENDENT'))
      errors.push(
        `RSS uncertainty for ${term.id} cannot hide shared contributors`,
      );
    uc = Math.hypot(...components);
  } else if (model.combinationRule === 'CONSERVATIVE_SUM') {
    uc = components.reduce((sum, value) => sum + Math.abs(value), 0);
  } else {
    const matrix = model.correlationMatrix;
    const size = components.length;
    if (
      !Array.isArray(matrix) ||
      matrix.length !== size ||
      matrix.some((row) => !Array.isArray(row) || row.length !== size)
    ) {
      errors.push(`covariance matrix for ${term.id} has wrong dimensions`);
      return;
    }
    for (let row = 0; row < size; row += 1)
      for (let column = 0; column < size; column += 1) {
        if (
          !Number.isFinite(matrix[row][column]) ||
          !equal(matrix[row][column], matrix[column][row]) ||
          (row === column && !equal(matrix[row][column], 1))
        )
          errors.push(
            `covariance matrix for ${term.id} must be symmetric with unit diagonal`,
          );
        if (
          row !== column &&
          model.contributors[row].sharing === 'INDEPENDENT' &&
          !equal(matrix[row][column], 0)
        )
          errors.push(
            `independent contributor in ${term.id} has nonzero covariance`,
          );
        if (!isPositiveSemidefinite(matrix))
          errors.push(
            `covariance matrix for ${term.id} must be positive semidefinite`,
          );
      }
    const variance = components.reduce(
      (sum, left, row) =>
        sum +
        components.reduce(
          (inner, right, column) => inner + left * right * matrix[row][column],
          0,
        ),
      0,
    );
    if (variance < -epsilon)
      errors.push(`covariance model for ${term.id} has negative variance`);
    uc = Math.sqrt(Math.max(0, variance));
  }
  if (!equal(model.uc, uc))
    errors.push(
      `term ${term.id} declared uc differs from computed uncertainty`,
    );
  if (!equal(model.expandedU, model.coverageFactorK * model.uc))
    errors.push(`term ${term.id} declared U must equal k times uc`);
}

function evaluateGroup(doc, observable, scopeId, terms, errors) {
  const network = terms.filter((term) => term.role === 'NETWORK_RESULT');
  if (
    observable.domain === 'INSERTION_LOSS_DB'
      ? network.length !== 1
      : observable.domain !== 'LANE_SKEW_PS' && network.length !== 1
  ) {
    errors.push(
      `observable ${observable.id}/${scopeId} must contain exactly one network result`,
    );
    return null;
  }
  if (observable.domain === 'LANE_SKEW_PS' && terms.length !== 1) {
    errors.push(`lane skew ${scopeId} needs one coupled derived term`);
    return null;
  }
  const choices = [];
  const [bandStart, bandStop] = doc.frequency.validatedBandHz;
  for (let index = 0; index < doc.frequency.sampleHz.length; index += 1) {
    if (
      doc.frequency.sampleHz[index] < bandStart ||
      doc.frequency.sampleHz[index] > bandStop
    )
      continue;
    let raw;
    if (observable.domain === 'LANE_SKEW_PS') {
      const set = doc.coupledLaneSets.find((value) => value.id === scopeId);
      const delays = set.scenarioIds.map((scenarioId) => {
        const delay = doc.observables.find(
          (value) =>
            value.domain === 'GROUP_DELAY_PS' && value.scope === 'PER_SCENARIO',
        );
        const delayTerms = doc.terms.filter(
          (term) =>
            term.observableId === delay?.id && term.scenarioId === scenarioId,
        );
        return delayTerms.length === 1
          ? delayTerms[0].samples[index].value
          : NaN;
      });
      raw = Math.max(...delays) - Math.min(...delays);
      if (!equal(raw, terms[0].samples[index].value))
        errors.push(
          `lane skew ${scopeId} must equal four-lane group-delay reducer`,
        );
    } else if (observable.domain === 'GROUP_DELAY_PS')
      raw = Math.abs(network[0].samples[index].value - observable.targetPs);
    else raw = terms.reduce((sum, term) => sum + term.samples[index].value, 0);
    const U = terms.reduce((sum, term) => sum + term.uncertainty.expandedU, 0);
    const margin = terms.reduce((sum, term) => sum + term.designMargin, 0);
    choices.push({
      frequencyHz: doc.frequency.sampleHz[index],
      bound:
        observable.reducer === 'MAXIMUM' ? raw + U + margin : raw - U - margin,
    });
  }
  if (!choices.length) {
    errors.push(
      `observable ${observable.id}/${scopeId} has no sample in validated band`,
    );
    return null;
  }
  return choices.reduce((worst, candidate) =>
    (
      observable.reducer === 'MAXIMUM'
        ? candidate.bound > worst.bound
        : candidate.bound < worst.bound
    )
      ? candidate
      : worst,
  );
}

function check(doc, label) {
  const schemaOk = validateSchema(doc);
  const errors = schemaOk
    ? semanticErrors(doc)
    : validateSchema.errors.map(
        (error) => `${error.instancePath || '/'} ${error.message}`,
      );
  if (errors.length) throw new Error(`${label}: ${errors.join('; ')}`);
}
function rejects(name, mutate) {
  const copy = structuredClone(synthetic);
  mutate(copy);
  try {
    check(copy, name);
  } catch {
    return;
  }
  throw new Error(`${name}: mutation unexpectedly passed`);
}

check(prototype, 'blocked Prototype A example');
check(synthetic, 'synthetic closed fixture');
const mutations = [
  [
    'uncovered-applicable-scenario',
    (x) => {
      x.terms = x.terms.filter((term) => term.scenarioId !== 'D3');
      x.closure.limits = x.closure.limits.filter(
        (limit) => limit.scenarioId !== 'D3',
      );
    },
  ],
  [
    'hidden-999-db-term',
    (x) => {
      const term = structuredClone(x.terms[0]);
      term.id = 'hidden';
      term.role = 'ALLOCATION_PENALTY';
      term.samples.forEach((sample) => {
        sample.value = 999;
      });
      x.terms.push(term);
    },
  ],
  [
    'assumption-closure',
    (x) => {
      x.terms[0].evidence.grade = 'D_ASSUMPTION';
    },
  ],
  [
    'empty-evidence',
    (x) => {
      x.terms[0].evidence.evidenceIds = [];
    },
  ],
  [
    'bad-ge-return-loss',
    (x) => {
      x.terms.find((term) => term.id === 'rl0').samples[1].value = 1;
    },
  ],
  [
    'single-lane-skew',
    (x) => {
      x.coupledLaneSets[0].scenarioIds = ['D0', 'D0', 'D0', 'D0'];
    },
  ],
  [
    'reversed-frequency-samples',
    (x) => {
      x.terms[0].samples.reverse();
    },
  ],
  [
    'out-of-sweep-frequency',
    (x) => {
      x.terms[0].samples[0].frequencyHz = 999;
    },
  ],
  [
    'conservative-sum-vs-rss',
    (x) => {
      const uncertainty = x.terms[0].uncertainty;
      uncertainty.contributors.push({
        ...uncertainty.contributors[0],
        id: 'u2',
      });
      uncertainty.combinationRule = 'CONSERVATIVE_SUM';
    },
  ],
  [
    'duplicate-mixed-mode-order',
    (x) => {
      x.mixedMode.order[1] = x.mixedMode.order[0];
    },
  ],
  [
    'empty-exclusion-reason',
    (x) => {
      x.scenarios[0].applicability = 'EXCLUDED';
    },
  ],
  [
    'unsupported-hiz',
    (x) => {
      x.scenarios[0].dutState = 'POWERED_ALL_PATHS_HIZ';
      x.scenarios[0].inactiveTermination = 'HiZ';
    },
  ],
  [
    'plain-thru-as-dut',
    (x) => {
      x.scenarios[0].fixtureStructureId = 'PLAIN';
    },
  ],
  [
    'validated-band-without-sample-and-out-of-band-worst',
    (x) => {
      x.frequency.validatedBandHz = [1_400_000_000, 1_600_000_000];
    },
  ],
  [
    'reversed-lane-in-coupled-skew',
    (x) => {
      x.scenarios.find((scenario) => scenario.id === 'D3').direction =
        'reverse';
    },
  ],
  [
    'hot-lane-in-coupled-skew',
    (x) => {
      x.scenarios.find((scenario) => scenario.id === 'D2').temperatureC = 85;
    },
  ],
  [
    'd0-scenario-on-d3-path',
    (x) => {
      x.terms.find((term) => term.id === 'il0').measurementPath.fromPortId =
        'D3_A_P';
    },
  ],
  [
    'unrelated-open-termination',
    (x) => {
      const scenario = x.scenarios.find((value) => value.id === 'D0');
      scenario.dutState = 'A_SELECTED_B_OPEN';
      scenario.inactiveTermination = 'open';
    },
  ],
  [
    'partial-inactive-pair-termination',
    (x) => {
      x.terminationNetworks[0].perPort.find(
        (mapping) => mapping.portId === 'D0_B_N',
      ).termination = 'measurement_port';
    },
  ],
  [
    'matched-transmission-destination',
    (x) => {
      x.terminationNetworks[0].perPort.find(
        (mapping) => mapping.portId === 'D0_C_P',
      ).termination = 'matched_50ohm';
    },
  ],
  [
    'wrong-plane-termination-network',
    (x) => {
      x.planes.push({
        id: 'WRONG_PLANE',
        kind: 'TEST_ONLY',
        description: 'Synthetic wrong-plane mutation.',
      });
      x.terminationNetworks[0].planeId = 'WRONG_PLANE';
    },
  ],
  [
    'cable-end-only-production-allocation',
    (x) => {
      x.claimBoundary.testOnly = false;
      x.planes[0].kind = 'CABLE_END';
      x.planes[0].description = 'Calibrated cable-end plane.';
      x.authoritativeEvidence[0].kind = 'MODEL';
      x.authoritativeEvidence[0].description = 'Modeled allocation input.';
      x.closure.limits.forEach((limit) => {
        limit.basis = 'INTEGRATED_REQUIREMENT';
      });
    },
  ],
  [
    'relabeled-production-test-artifacts',
    (x) => {
      x.claimBoundary.testOnly = false;
      x.planes[0].kind = 'PCB_PACKAGE_LAND';
      x.authoritativeEvidence[0].kind = 'MODEL';
      x.closure.limits.forEach((limit) => {
        limit.basis = 'INTEGRATED_REQUIREMENT';
      });
    },
  ],
  [
    'duplicate-accepted-evidence-id',
    (x) => {
      x.closure.acceptedEvidenceIds.push('TEST_ONLY_EVIDENCE');
    },
  ],
];
for (const [name, mutate] of mutations) rejects(name, mutate);
check(synthetic, 'signed-coupling-accepted');
console.log(
  `channel-budget contract verified: in-band reduction, differential-pair termination and measurement-port proof, lane/topology/plane closure boundaries, signed coupling, and ${mutations.length} adversarial negatives`,
);
