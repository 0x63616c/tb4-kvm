'use client';

import { useMemo, useState } from 'react';
import topologyContract from '@/design/pcb1a/topology.contract.json';
import { buildTopologySelection } from '@/lib/site-topology-model.mjs';

type LaneId = (typeof topologyContract.topology.laneIds)[number];
type Branch = 'HOST_A' | 'HOST_B';

const contract = topologyContract;
const laneIds = contract.topology.laneIds as LaneId[];
const fixtureClasses = contract.structureClasses;
const campaign = contract.pathCampaignRule;
const prohibitedDomains = contract.claimBoundary.prohibitedDomains;
const notClaimed = contract.reviewInputs.notClaimedByThisContract;

const frontendFacts = [
  {
    title: '39 host checks',
    detail:
      'The portable frontend passes 39 deterministic host checks, plus an opt-in fail-closed UBSan run.',
    source: 'firmware/controller-pico2/test_low_speed_frontend.c',
  },
  {
    title: 'Static / BSS',
    detail:
      'The inert Pico binding keeps its approximately 2.1 KiB frontend in static/BSS storage.',
    source: 'firmware/controller-pico2/main.c',
  },
  {
    title: 'Null-backed boundary',
    detail:
      'The binding initializes a RAM-only diagnostic projection with no peripheral I/O.',
    source: 'firmware/controller-pico2/low_speed_frontend.h',
  },
];

const absentControls = [
  'GPIO',
  'USB-C / CC',
  'PD',
  'VBUS / VCONN',
  'Thunderbolt power',
];

export function SiteTopologyExplorer() {
  const [lane, setLane] = useState<LaneId>('D0');
  const [branch, setBranch] = useState<Branch>('HOST_A');

  const selection = useMemo(
    () => buildTopologySelection(contract, lane, branch),
    [branch, lane],
  );
  const { selectedPath, inactiveBranch, inactivePortIds } = selection;

  return (
    <section
      className="module-surface site-topology-explorer"
      aria-labelledby="site-topology-explorer-title"
      style={styles.shell}
    >
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>PCB-1A · topology contract</p>
          <h2 id="site-topology-explorer-title" style={styles.title}>
            See one RF lane at a time
          </h2>
          <p style={styles.lede}>
            This is a measurement coupon, not a finished Thunderbolt product.
            Pick a lane and branch to inspect the proposed path from a host
            through the mux to Common.
          </p>
        </div>
        <div style={styles.badges} aria-label="Evidence status">
          <span style={styles.badge}>{contract.status}</span>
          <span style={styles.badgeMuted}>
            {contract.orderReady ? 'ORDER READY' : 'NO ORDER'}
          </span>
        </div>
      </div>

      <div style={styles.controls}>
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Choose lane</legend>
          <div style={styles.controlRow}>
            {laneIds.map((laneId) => (
              <button
                key={laneId}
                type="button"
                aria-pressed={lane === laneId}
                onClick={() => setLane(laneId)}
                style={{
                  ...styles.choice,
                  ...(lane === laneId ? styles.choiceSelected : {}),
                }}
              >
                {laneId}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Select active host branch</legend>
          <div style={styles.controlRow}>
            {(['HOST_A', 'HOST_B'] as Branch[]).map((host) => (
              <button
                key={host}
                type="button"
                aria-pressed={branch === host}
                onClick={() => setBranch(host)}
                style={{
                  ...styles.choice,
                  ...(branch === host ? styles.choiceSelected : {}),
                }}
              >
                {host === 'HOST_A' ? 'Host A' : 'Host B'}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div
        className="site-topology-diagram"
        aria-label={`${lane} ${branch} to Common signal path`}
      >
        <div style={styles.node}>
          <span style={styles.nodeKicker}>SELECTABLE INPUT</span>
          <strong>{branch === 'HOST_A' ? 'Host A' : 'Host B'}</strong>
          <small>{selectedPath?.endpointPortIds.slice(0, 2).join(' / ')}</small>
        </div>
        <span
          className="site-topology-arrow"
          style={styles.arrow}
          aria-hidden="true"
        >
          →
        </span>
        <div style={styles.node}>
          <span style={styles.nodeKicker}>FOUR-PAIR MUX</span>
          <strong>RF mux branch</strong>
          <small>one differential pair at a time</small>
        </div>
        <span
          className="site-topology-arrow"
          style={styles.arrow}
          aria-hidden="true"
        >
          →
        </span>
        <div style={{ ...styles.node, ...styles.nodeCommon }}>
          <span style={styles.nodeKicker}>SELECTABLE OUTPUT</span>
          <strong>Common</strong>
          <small>{selectedPath?.endpointPortIds.slice(2).join(' / ')}</small>
        </div>
      </div>

      <div className="site-topology-inspector" aria-live="polite">
        <div>
          <p style={styles.cardKicker}>Inspector</p>
          <h3 style={styles.cardTitle}>{selectedPath?.id ?? `${lane} path`}</h3>
          <p style={styles.cardText}>
            Measure exactly the four P/N endpoint ports for this path at the{' '}
            <strong>{campaign.measurementPlane}</strong> plane. The other host
            branch is not allowed to become a direct host-to-host net.
          </p>
        </div>
        <dl className="site-topology-metrics">
          <div>
            <dt>Measured path</dt>
            <dd>{campaign.expectedMeasuredPortCount} ports</dd>
          </div>
          <div>
            <dt>Inactive {inactiveBranch.replace('HOST_', 'Host ')}</dt>
            <dd>
              {inactivePortIds.length ||
                campaign.expectedInactiveBundlePortCount}{' '}
              ports
            </dd>
          </div>
          <div>
            <dt>Remaining bundle</dt>
            <dd>{campaign.expectedRemainingUnmeasuredPortCount} ports</dd>
          </div>
        </dl>
      </div>

      <div className="site-topology-lower-grid">
        <article style={styles.card}>
          <p style={styles.cardKicker}>Campaign recipe</p>
          <h3 style={styles.cardTitle}>
            Every applicable selected campaign state accounts for 4 + 8 + 12
          </h3>
          <p style={styles.cardText}>
            <strong>4</strong> ports are the selected path, <strong>8</strong>{' '}
            belong to the inactive host termination, and the remaining{' '}
            <strong>12</strong> are also unmeasured and held at matched
            cable-end terminations. This campaign is currently{' '}
            <strong>
              {campaign.campaignStatus.replaceAll('_', ' ').toLowerCase()}
            </strong>
            .
          </p>
          <p style={styles.note}>
            A fixture count is not claimed until launch, ESD, stack-up, and lab
            choices are frozen.
          </p>
        </article>
        <article style={styles.card}>
          <p style={styles.cardKicker}>Fixture classes</p>
          <ul style={styles.list}>
            {fixtureClasses.map((fixture) => (
              <li key={fixture.id} style={styles.listItem}>
                <strong>{fixture.kind.replaceAll('_', ' ')}</strong>
                <span>{fixture.notes}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="site-topology-claim-boundary">
        <article style={styles.card}>
          <p style={styles.cardKicker}>Coupon excludes</p>
          <div style={styles.absentList}>
            {prohibitedDomains.map((domain) => (
              <span key={domain} style={styles.absent}>
                No {domain.replaceAll('_', ' ')}
              </span>
            ))}
          </div>
        </article>
        <article style={styles.card}>
          <p style={styles.cardKicker}>Not claimed</p>
          <ul style={styles.list}>
            {notClaimed.map((claim) => (
              <li key={claim} style={styles.listItem}>
                <strong>{claim.replaceAll('_', ' ')}</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="site-topology-frontend">
        <div>
          <p style={styles.cardKicker}>Null-backed Pico frontend</p>
          <h3 style={styles.cardTitle}>Status projection only</h3>
          <p style={styles.cardText}>
            The Pico target demonstrates a bounded low-speed software boundary.
            It does not sense or drive the RF, USB-C, power, or Thunderbolt
            domains.
          </p>
          <div style={styles.absentList} aria-label="Controls not present">
            {absentControls.map((control) => (
              <span key={control} style={styles.absent}>
                No {control}
              </span>
            ))}
          </div>
        </div>
        <div style={styles.frontendFacts}>
          {frontendFacts.map((fact) => (
            <div key={fact.title} style={styles.frontendFact}>
              <strong>{fact.title}</strong>
              <span>{fact.detail}</span>
              <code>{fact.source}</code>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: 'grid',
    gap: 24,
    padding: '28px',
    border: '1px solid var(--line, #243c36)',
    borderRadius: 16,
    background: 'rgba(13,25,23,.86)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 24,
    alignItems: 'start',
    flexWrap: 'wrap',
  },
  eyebrow: {
    margin: 0,
    color: 'var(--teal, #47e6c1)',
    font: '650 11px/1.35 var(--font-mono)',
    letterSpacing: '.1em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '8px 0 0',
    fontSize: 'clamp(25px, 4vw, 40px)',
    letterSpacing: '-.04em',
  },
  lede: {
    maxWidth: 700,
    margin: '12px 0 0',
    color: 'var(--muted, #91a69f)',
    lineHeight: 1.6,
  },
  badges: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  badge: {
    padding: '7px 10px',
    border: '1px solid rgba(255,200,97,.5)',
    borderRadius: 999,
    color: 'var(--amber, #ffc861)',
    font: '700 11px var(--font-mono)',
    letterSpacing: '.08em',
  },
  badgeMuted: {
    padding: '7px 10px',
    border: '1px solid var(--line, #243c36)',
    borderRadius: 999,
    color: 'var(--muted, #91a69f)',
    font: '700 11px var(--font-mono)',
    letterSpacing: '.08em',
  },
  controls: { display: 'flex', gap: 18, flexWrap: 'wrap' },
  fieldset: { minWidth: 180, margin: 0, padding: 0, border: 0 },
  legend: {
    marginBottom: 9,
    color: 'var(--muted, #91a69f)',
    fontSize: 12,
    fontWeight: 650,
  },
  controlRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  choice: {
    cursor: 'pointer',
    padding: '9px 13px',
    color: 'var(--foreground, #ecf7f1)',
    border: '1px solid var(--line, #243c36)',
    borderRadius: 8,
    background: 'transparent',
    font: '650 13px var(--font-mono)',
  },
  choiceSelected: {
    color: '#07100f',
    borderColor: 'var(--lime, #b9ff66)',
    background: 'var(--lime, #b9ff66)',
  },
  node: {
    display: 'grid',
    gap: 7,
    minHeight: 120,
    alignContent: 'center',
    padding: 18,
    border: '1px solid rgba(71,230,193,.35)',
    borderRadius: 12,
    background: 'rgba(71,230,193,.06)',
  },
  nodeCommon: {
    borderColor: 'rgba(185,255,102,.45)',
    background: 'rgba(185,255,102,.06)',
  },
  nodeKicker: {
    color: 'var(--teal, #47e6c1)',
    font: '650 10px var(--font-mono)',
    letterSpacing: '.08em',
  },
  arrow: { color: 'var(--lime, #b9ff66)', fontSize: 28, textAlign: 'center' },
  cardKicker: {
    margin: 0,
    color: 'var(--teal, #47e6c1)',
    font: '650 10px var(--font-mono)',
    letterSpacing: '.1em',
    textTransform: 'uppercase',
  },
  cardTitle: { margin: '7px 0 0', fontSize: 19 },
  cardText: {
    margin: '9px 0 0',
    color: 'var(--muted, #91a69f)',
    lineHeight: 1.55,
  },
  card: {
    padding: 18,
    border: '1px solid var(--line, #243c36)',
    borderRadius: 12,
  },
  note: {
    margin: '14px 0 0',
    color: 'var(--amber, #ffc861)',
    fontSize: 12,
    lineHeight: 1.5,
  },
  list: {
    display: 'grid',
    gap: 12,
    margin: '15px 0 0',
    padding: 0,
    listStyle: 'none',
  },
  absentList: { display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 16 },
  absent: {
    padding: '5px 8px',
    borderRadius: 6,
    color: 'var(--muted, #91a69f)',
    background: 'rgba(145,166,159,.1)',
    fontSize: 11,
  },
  frontendFacts: { display: 'grid', gap: 10 },
  frontendFact: {
    display: 'grid',
    gap: 4,
    padding: '10px 12px',
    borderRadius: 8,
    background: 'rgba(255,200,97,.06)',
  },
  listItem: { display: 'grid', gap: 3 },
};
