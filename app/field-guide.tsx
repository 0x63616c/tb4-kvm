'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Cable,
  Check,
  ChevronRight,
  CircleAlert,
  Cpu,
  ExternalLink,
  GitBranch,
  Gauge,
  Power,
  Search,
  ShieldCheck,
  Split,
  X,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import controllerModel from '@/design/control-state-machine.json';
import evidenceLedger from '@/evidence/ledger.json';

type PinGroup = 'ground' | 'power' | 'fast' | 'cc' | 'usb2' | 'sbu';
type ControlState = {
  id: string;
  label: string;
  route: 'A' | 'B' | 'OFF';
  vbusSource: 'A' | 'B' | 'OFF';
  pdContract: 'A' | 'B' | 'NONE';
  link: 'DOWN' | 'TRAINING' | 'READY';
  display: string;
  observable: string;
};
type EvidenceRecord = {
  id: string;
  kind: string;
  title: string;
  status: string;
  owner: string;
  evidence: string[];
  blockers: string[];
};

const controlStates = controllerModel.states as ControlState[];
const aToBSequence = controllerModel.sequences.A_TO_B.map((id) =>
  controlStates.find((state) => state.id === id)!,
);
const faultState = controlStates.find(
  (state) => state.id === controllerModel.faultTarget,
)!;
const evidenceRecords = evidenceLedger.records as EvidenceRecord[];
const sourceRevision = import.meta.env.VITE_GIT_COMMIT ?? '';
const hasImmutableSourceRevision = /^[0-9a-f]{40}$/.test(sourceRevision);

const pinGroups: Record<
  PinGroup,
  { title: string; job: string; switchedBy: string; detail: string }
> = {
  ground: {
    title: 'Ground and shield return',
    job: 'The electrical reference and return path.',
    switchedBy: 'Never switched',
    detail:
      'Multiple contacts reduce resistance. At 20 Gb/s per pair, the return geometry and connector-shell bonding matter as much as the named signal trace.',
  },
  power: {
    title: 'VBUS power',
    job: 'Carries negotiated charging power.',
    switchedBy: 'Protected power FETs',
    detail:
      'VBUS starts safely and only rises after the Type-C/PD rules permit it. The two laptop VBUS rails must never be connected together.',
  },
  fast: {
    title: 'Four high-speed differential pairs',
    job: 'Carry the USB4/Thunderbolt packet link.',
    switchedBy: 'Four-channel 20 Gb/s mux',
    detail:
      'These are TX1, RX1, TX2 and RX2. Each “channel” is one matched two-wire pair. TB4 bonds lanes to create the 40 Gb/s link.',
  },
  cc: {
    title: 'CC1 and CC2',
    job: 'Detect attach, orientation, roles and carry PD messages.',
    switchedBy: 'USB-C/PD controller',
    detail:
      'One becomes the active Configuration Channel. The unused contact may supply VCONN to an electronic cable marker. These are not ordinary GPIO signals.',
  },
  usb2: {
    title: 'USB 2 D+ and D−',
    job: 'Carry legacy 480 Mb/s USB separately.',
    switchedBy: 'USB 2 analog switch',
    detail:
      'USB 2 is not tunneled through the 40 Gb/s physical link at the connector. The duplicate receptacle contacts support flipping the plug.',
  },
  sbu: {
    title: 'SBU1 and SBU2',
    job: 'Carry sideband/link-management or DisplayPort AUX signals.',
    switchedBy: 'SBU crossbar / PD subsystem',
    detail:
      'USB4 and Thunderbolt use these for sideband communication. Orientation-aware routing is required.',
  },
};

const pins: Array<{ name: string; group: PinGroup }> = [
  { name: 'A1 GND', group: 'ground' },
  { name: 'A2 TX1+', group: 'fast' },
  { name: 'A3 TX1−', group: 'fast' },
  { name: 'A4 VBUS', group: 'power' },
  { name: 'A5 CC1', group: 'cc' },
  { name: 'A6 D+', group: 'usb2' },
  { name: 'A7 D−', group: 'usb2' },
  { name: 'A8 SBU1', group: 'sbu' },
  { name: 'A9 VBUS', group: 'power' },
  { name: 'A10 RX2−', group: 'fast' },
  { name: 'A11 RX2+', group: 'fast' },
  { name: 'A12 GND', group: 'ground' },
  { name: 'B12 GND', group: 'ground' },
  { name: 'B11 RX1+', group: 'fast' },
  { name: 'B10 RX1−', group: 'fast' },
  { name: 'B9 VBUS', group: 'power' },
  { name: 'B8 SBU2', group: 'sbu' },
  { name: 'B7 D−', group: 'usb2' },
  { name: 'B6 D+', group: 'usb2' },
  { name: 'B5 CC2', group: 'cc' },
  { name: 'B4 VBUS', group: 'power' },
  { name: 'B3 TX2−', group: 'fast' },
  { name: 'B2 TX2+', group: 'fast' },
  { name: 'B1 GND', group: 'ground' },
];

const negotiate = [
  {
    n: '01',
    title: 'Attach detection',
    body: 'Pull-up and pull-down terminations on CC tell the ports that something was connected.',
    observe: 'PD controller: attached / detached',
  },
  {
    n: '02',
    title: 'Orientation',
    body: 'Whichever CC contact is active reveals which way the reversible plug entered.',
    observe: 'PD controller: CC1 or CC2 active',
  },
  {
    n: '03',
    title: 'Safe initial power',
    body: 'The source enables the initial VBUS state without exposing either laptop to the other laptop’s rail.',
    observe: 'Voltage monitor and protection state',
  },
  {
    n: '04',
    title: 'Cable discovery',
    body: 'If the cable is electronically marked, VCONN powers its marker and PD messages read its capabilities.',
    observe: 'PD-controller cable identity event',
  },
  {
    n: '05',
    title: 'Power contract',
    body: 'Source and sink agree on voltage and current, such as 20 V at 3 A for 60 W.',
    observe: 'Negotiated volts and amps',
  },
  {
    n: '06',
    title: 'Enter USB4 / TB mode',
    body: 'The port and cable capabilities are checked before the high-speed fabric is enabled.',
    observe: 'PD alternate-mode / Enter_USB state',
  },
  {
    n: '07',
    title: 'Sideband connection',
    body: 'SBU1/SBU2 carry link-management communication and account for orientation.',
    observe: 'Controller state; not packet payload',
  },
  {
    n: '08',
    title: 'Lane training',
    body: 'The two transmit and two receive paths equalize, align and form the full link.',
    observe: 'Thunderbolt controller, analyzer, or host OS',
  },
  {
    n: '09',
    title: 'Router discovery',
    body: 'USB4 routers discover the topology: computer, KVM router, dock and downstream devices.',
    observe: 'Host topology and controller events',
  },
  {
    n: '10',
    title: 'Tunnels open',
    body: 'USB 3, DisplayPort and PCIe paths are created and share the available link bandwidth.',
    observe: 'Host OS plus functional devices',
  },
];

const glossary = [
  [
    'Alt Mode',
    'A USB-C mode that assigns high-speed or sideband contacts to another protocol, such as DisplayPort.',
  ],
  [
    'BERT',
    'Bit Error Rate Tester: lab equipment that sends known high-speed patterns and counts errors.',
  ],
  [
    'CC',
    'Configuration Channel: the USB-C contact used for attach, orientation, roles and Power Delivery communication.',
  ],
  [
    'Channel',
    'For the mux, one independently routed signal path. A differential channel normally contains two physical conductors.',
  ],
  [
    'Common-mode noise',
    'Noise appearing similarly on both wires of a differential pair; subtraction at the receiver rejects much of it.',
  ],
  [
    'Crossbar',
    'A switch that can route signals straight or crossed, useful when connector orientation changes.',
  ],
  [
    'Differential pair',
    'Two matched wires carrying opposite signal polarity; the receiver reads the voltage difference.',
  ],
  [
    'DFP / UFP',
    'Downstream- and upstream-facing data roles. They are related to data direction, not necessarily power direction.',
  ],
  [
    'DMC',
    'Dock Management Controller: firmware/control logic coordinating a dock’s PD and Thunderbolt subsystems.',
  ],
  [
    'E-marker / EMCA',
    'Electronics inside a cable that report its speed, current and construction capabilities.',
  ],
  [
    'ESD protection',
    'Very-low-capacitance protection that diverts electrostatic discharges away from sensitive silicon.',
  ],
  [
    'Eye diagram',
    'An oscilloscope view of many bits overlaid; the open center indicates timing and voltage margin.',
  ],
  ['Full duplex', 'Traffic can move in both directions simultaneously.'],
  [
    'High impedance / Hi-Z',
    'An electrically disconnected switch state used to guarantee break-before-make.',
  ],
  [
    'Insertion loss',
    'How much signal energy a connector, trace or switch removes from the channel, measured in dB versus frequency.',
  ],
  [
    'Lane',
    'One high-speed serial path in a multi-lane link. TB4 bonds lanes to reach its total link rate.',
  ],
  [
    'Link training',
    'Endpoints adapt equalization, polarity and lane alignment until reliable communication is established.',
  ],
  [
    'MCU',
    'Microcontroller: the small programmable controller for buttons, sequencing, display and telemetry—not Thunderbolt data.',
  ],
  [
    'Mux',
    'Multiplexer: an electronic selector that connects one of several inputs to a common output.',
  ],
  [
    'NRZ',
    'Non-return-to-zero, the two-level signalling used by the TB4/USB4 Gen3 physical link.',
  ],
  [
    'PD',
    'USB Power Delivery: messages sent over CC to negotiate voltage, current, roles and modes.',
  ],
  [
    'PCIe tunnel',
    'PCI Express transactions packaged for transport through the USB4/Thunderbolt fabric.',
  ],
  [
    'PHY',
    'The physical-layer electronics that transmit and receive the actual high-speed electrical signal.',
  ],
  [
    'Redriver',
    'Analog signal conditioning that boosts/equalizes a signal without fully decoding its protocol.',
  ],
  [
    'Retimer',
    'A more capable signal conditioner that recovers timing and retransmits a fresh signal while participating in link behavior.',
  ],
  [
    'Router',
    'The USB4/Thunderbolt component that discovers paths and moves protocol packets between ports and adapters.',
  ],
  [
    'SBU',
    'Sideband Use contacts. Thunderbolt/USB4 use them for link-management communication.',
  ],
  [
    'S-parameters',
    'Frequency-domain measurements/models describing loss, reflection and coupling through a high-speed structure.',
  ],
  [
    'TDR / VNA',
    'Instruments used to inspect impedance discontinuities and frequency-dependent channel behavior.',
  ],
  [
    'Tunnel',
    'A virtual path carrying another protocol—USB 3, DisplayPort or PCIe—inside the USB4 packet fabric.',
  ],
  [
    'VBUS',
    'The USB-C power conductor. In this design it needs isolated, protected switching for each host.',
  ],
  [
    'VCONN',
    'Power placed on the unused CC contact to run electronics inside an active/e-marked cable.',
  ],
];

const sources = [
  [
    'USB-IF USB4 overview',
    'Two-lane operation and dynamically shared data/display protocols.',
    'https://www.usb.org/usb4',
  ],
  [
    'USB Type-C specification',
    'Connector contacts, CC, orientation, VBUS, VCONN and sideband rules.',
    'https://www.usb.org/usb-type-cr-cable-and-connector-specification',
  ],
  [
    'Intel JHL9440',
    'Current quad-port Thunderbolt 4 accessory-controller family.',
    'https://www.intel.com/content/www/us/en/products/sku/225918/intel-jhl9440-thunderbolt-4-accessory-controller/specifications.html',
  ],
  [
    'Infineon CCG5',
    'Documented dual-upstream Thunderbolt dock application, USB2/SBU routing and PD control.',
    'https://www.infineon.com/assets/row/public/documents/24/49/infineon-ez-pd-ccg5-usb-type-c-port-controller-datasheet-en.pdf',
  ],
  [
    'TI TMUXHS4512',
    '20 Gb/s routing for four main pairs plus auxiliary signals; does not switch CC/VBUS.',
    'https://www.ti.com/product/TMUXHS4512',
  ],
  [
    'Diodes PI3DBS16412',
    'Four-channel 20 Gb/s mux found in a shipping TB4 KVM dock.',
    'https://www.diodes.com/part/view/PI3DBS16412',
  ],
  [
    'SSI certified KVM hub',
    'Shipping 40 Gb/s, two-computer Thunderbolt KVM precedent.',
    'https://www.thunderbolttechnology.net/product/ssi-tbt4-kvm-hub',
  ],
  [
    'Sabrent KVM teardown',
    'Third-party component identification and board architecture.',
    'https://dancharblog.wordpress.com/2023/07/13/sabrent-thunderbolt-4-kvm-dock-teardown-and-review/',
  ],
  [
    'USB4 compliance',
    'Approved analyzer, oscilloscope and BERT families for formal testing.',
    'https://www.usb.org/usb4compliance',
  ],
  [
    'Thunderbolt developer portal',
    'Controller documentation and certification access path.',
    'https://www.thunderbolttechnology.net/developer-application/new',
  ],
];

export default function FieldGuide() {
  const [group, setGroup] = useState<PinGroup>('fast');
  const [negotiationStep, setNegotiationStep] = useState(0);
  const [traffic, setTraffic] = useState<'usb' | 'display' | 'pcie'>('pcie');
  const [selectedHost, setSelectedHost] = useState<'A' | 'B'>('A');
  const [controlStep, setControlStep] = useState(0);
  const [controlFault, setControlFault] = useState(false);
  const [query, setQuery] = useState('');

  const filteredGlossary = useMemo(
    () =>
      glossary.filter(([term, meaning]) =>
        `${term} ${meaning}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const current = negotiate[negotiationStep];
  const activeControlState = controlFault
    ? faultState
    : aToBSequence[controlStep];

  return (
    <main className="min-h-screen">
      <header className="site-header">
        <a
          className="brand"
          href="#top"
          aria-label="Thunderbolt KVM field guide home"
        >
          <span className="brand-mark">
            <GitBranch size={18} />
          </span>
          <span>TB4 KVM Field Guide</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#learn">Learn</a>
          <a href="#architecture">Architecture</a>
          <a href="#parts">Parts</a>
          <a href="#test">Test</a>
          <a href="#gate">Build gate</a>
          <a href="#glossary">Glossary</a>
        </nav>
        <span className="phase-chip">Design review</span>
      </header>

      <section className="intro" id="top">
        <div className="intro-copy">
          <p className="eyebrow">
            Two computers · one Thunderbolt 4 dock · one physical switch
          </p>
          <h1>
            Understand every signal <span>before</span> we route a PCB.
          </h1>
          <p className="lede">
            This is the research package and learning surface for a genuinely
            open-source 40 Gb/s KVM. It separates what is proven, what is
            proposed and what still needs a bench test.
          </p>
          <div className="intro-actions">
            <a className="primary-action" href="#learn">
              Start the walkthrough <ArrowRight size={17} />
            </a>
            <a className="secondary-action" href="#verdict">
              Jump to the verdict
            </a>
          </div>
          <div className="guardrail">
            <ShieldCheck size={17} /> PCB work is gated behind your review of
            this research.
          </div>
        </div>
        <div className="verdict-panel" id="verdict">
          <div className="verdict-label">
            <Check size={15} /> Research verdict
          </div>
          <h2>Build a TB4 KVM dock, not a passive three-receptacle coupler.</h2>
          <p>
            A commercial precedent proves that two upstream hosts can be
            selected before one Thunderbolt router. A standalone mux placed
            between two complete cables remains an undefined, signal-loss-heavy
            topology.
          </p>
          <div className="verdict-facts">
            <span>
              <b>Target</b> TB4 · 40 Gb/s
            </span>
            <span>
              <b>Control</b> Tiny MCU + display
            </span>
            <span>
              <b>Expected</b> Rev A + correction
            </span>
          </div>
        </div>
      </section>

      <section
        className="evidence-dashboard"
        aria-labelledby="evidence-heading"
      >
        <div className="evidence-dashboard-heading">
          <div>
            <p className="eyebrow">Live from the repository evidence ledger</p>
            <h2 id="evidence-heading">
              The project is moving, but the integrated PCB gate is closed.
            </h2>
          </div>
          <span>{evidenceLedger.updated}</span>
        </div>
        <div className="evidence-summary">
          {evidenceLedger.statusVocabulary.map((status) => (
            <div
              key={status}
              className={`evidence-count evidence-${status.toLowerCase()}`}
            >
              <b>
                {
                  evidenceRecords.filter((record) => record.status === status)
                    .length
                }
              </b>
              <span>{status}</span>
            </div>
          ))}
        </div>
        <div className="evidence-gates">
          {evidenceRecords
            .filter(
              (record) =>
                record.kind === 'gate' || record.id === 'DEC-PCB1-001',
            )
            .map((record) => (
              <article key={record.id}>
                <div>
                  <code>{record.id}</code>
                  <span
                    className={`evidence-state evidence-${record.status.toLowerCase()}`}
                  >
                    {record.status}
                  </span>
                </div>
                <h3>{record.title}</h3>
                <p>Owner: {record.owner}</p>
                <dl className="evidence-links">
                  <div>
                    <dt>Evidence</dt>
                    <dd>
                      {record.evidence.map((item) => (
                        <span key={item}>
                          {hasImmutableSourceRevision ? (
                            <a
                              href={`https://github.com/0x63616c/tb4-kvm/blob/${sourceRevision}/${item}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {item}
                            </a>
                          ) : (
                            item
                          )}
                        </span>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt>Blockers</dt>
                    <dd>
                      {record.blockers.length
                        ? record.blockers.join(' · ')
                        : 'None recorded'}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
        </div>
        <p className="evidence-caveat">
          This dashboard is generated from <code>evidence/ledger.json</code>.
          “Modeled” means an identified model passed its own checks; it does not
          mean fabricated, measured or compliant. Evidence links are enabled
          only when the build carries an immutable 40-character Git revision;
          this build reports{' '}
          <code>
            {hasImmutableSourceRevision
              ? sourceRevision
              : 'unreleased-working-tree'}
          </code>
          .
        </p>
      </section>

      <div className="section-rule">
        <span>01</span>
        <p>Connector and signals</p>
      </div>
      <section className="module" id="learn">
        <div className="module-heading">
          <p className="eyebrow">Click a contact group</p>
          <h2>USB-C is six different electrical jobs sharing one connector.</h2>
          <p>
            The 24 contacts are not 24 interchangeable wires. Select a color to
            see who owns it in the KVM.
          </p>
        </div>
        <div className="pin-explorer">
          <div>
            <div
              className="connector-shell"
              aria-label="Simplified USB-C receptacle contact map"
            >
              <div className="pin-row">
                {pins.slice(0, 12).map((pin) => (
                  <button
                    key={pin.name}
                    onClick={() => setGroup(pin.group)}
                    className={`pin pin-${pin.group} ${group === pin.group ? 'pin-active' : ''}`}
                    aria-label={pin.name}
                  >
                    <span>{pin.name.split(' ')[1]}</span>
                    <small>{pin.name.split(' ')[0]}</small>
                  </button>
                ))}
              </div>
              <div className="connector-mouth" />
              <div className="pin-row pin-row-bottom">
                {pins.slice(12).map((pin) => (
                  <button
                    key={pin.name}
                    onClick={() => setGroup(pin.group)}
                    className={`pin pin-${pin.group} ${group === pin.group ? 'pin-active' : ''}`}
                    aria-label={pin.name}
                  >
                    <span>{pin.name.split(' ')[1]}</span>
                    <small>{pin.name.split(' ')[0]}</small>
                  </button>
                ))}
              </div>
            </div>
            <p className="figure-caption">
              Simplified USB-C receptacle contact map. Duplicate contacts
              support plug reversal and current capacity.
            </p>
          </div>
          <aside className={`pin-detail detail-${group}`}>
            <p className="detail-kicker">Selected system</p>
            <h3>{pinGroups[group].title}</h3>
            <dl>
              <div>
                <dt>Job</dt>
                <dd>{pinGroups[group].job}</dd>
              </div>
              <div>
                <dt>KVM treatment</dt>
                <dd>{pinGroups[group].switchedBy}</dd>
              </div>
            </dl>
            <p>{pinGroups[group].detail}</p>
          </aside>
        </div>
      </section>

      <section className="two-up module-surface">
        <article>
          <p className="eyebrow">Differential means “subtract”</p>
          <h2>One channel is a carefully matched pair of copper traces.</h2>
          <svg
            className="wave-diagram"
            viewBox="0 0 640 180"
            aria-labelledby="wave-title"
          >
            <title id="wave-title">
              Opposite P and N waveforms with shared noise
            </title>
            <path className="wave-grid" d="M20 45H620M20 90H620M20 135H620" />
            <path
              className="wave-p"
              d="M20 84 C55 20,90 20,125 84 S195 148,230 84 S300 20,335 84 S405 148,440 84 S510 20,545 84 S590 144,620 84"
            />
            <path
              className="wave-n"
              d="M20 96 C55 160,90 160,125 96 S195 32,230 96 S300 160,335 96 S405 32,440 96 S510 160,545 96 S590 36,620 96"
            />
            <text x="24" y="28">
              P
            </text>
            <text x="24" y="166">
              N
            </text>
          </svg>
          <p className="explain-copy">
            The receiver reads <code>P − N</code>. Noise that hits both traces
            similarly mostly disappears in the subtraction. That only works when
            the pair stays geometrically matched.
          </p>
        </article>
        <article>
          <p className="eyebrow">What “six-channel” actually means</p>
          <h2>The mux has six routed paths. TB4 consumes four of them.</h2>
          <div className="channel-list">
            {[
              'D0± · TB4 pair 1',
              'D1± · TB4 pair 2',
              'D2± · TB4 pair 3',
              'D3± · TB4 pair 4',
              'DDC/AUX± · SBU pair',
              'HPD · single sideband',
            ].map((label, index) => (
              <div
                key={label}
                className={index < 4 ? 'channel-fast' : 'channel-side'}
              >
                <span>CH {index + 1}</span>
                <i />
                <strong>{label}</strong>
              </div>
            ))}
          </div>
          <div className="correction-note">
            <CircleAlert size={17} />
            <p>
              <b>Important:</b> the TI TMUXHS4512’s sixth path is a single HPD
              signal. USB 2 D+/D− still needs a separate two-wire switch. CC and
              VBUS are also outside this mux.
            </p>
          </div>
        </article>
      </section>

      <div className="section-rule">
        <span>02</span>
        <p>How Thunderbolt 4 moves data</p>
      </div>
      <section className="module packet-module">
        <div className="module-heading">
          <p className="eyebrow">
            A packet fabric, not raw HDMI plus USB wires
          </p>
          <h2>
            Thunderbolt shares one trained link among several tunneled
            protocols.
          </h2>
          <p>
            Choose a traffic type. The physical link stays the same; the packet
            payload and destination change.
          </p>
        </div>
        <fieldset className="traffic-controls" aria-label="Traffic type">
          <Button
            className={traffic === 'usb' ? 'traffic-active' : ''}
            variant="outline"
            onClick={() => setTraffic('usb')}
          >
            USB 3
          </Button>
          <Button
            className={traffic === 'display' ? 'traffic-active' : ''}
            variant="outline"
            onClick={() => setTraffic('display')}
          >
            DisplayPort
          </Button>
          <Button
            className={traffic === 'pcie' ? 'traffic-active' : ''}
            variant="outline"
            onClick={() => setTraffic('pcie')}
          >
            PCIe
          </Button>
        </fieldset>
        <div className={`packet-path traffic-${traffic}`}>
          <div className="path-node">
            <Cpu />
            <b>Mac router</b>
            <small>Creates protocol packets</small>
          </div>
          <div className="packet-lane">
            <span className="packet packet-usb">USB</span>
            <span className="packet packet-display">DP</span>
            <span className="packet packet-pcie">PCIe</span>
            <i />
            <small>two TX lanes + two RX lanes</small>
          </div>
          <div className="path-node">
            <Split />
            <b>TB4 KVM router</b>
            <small>Forwards the selected paths</small>
          </div>
          <div className="packet-lane short">
            <span className={`packet packet-${traffic}`}>
              {traffic === 'display' ? 'DP' : traffic.toUpperCase()}
            </span>
            <i />
          </div>
          <div className="path-node">
            <Cable />
            <b>OWC dock</b>
            <small>
              {traffic === 'pcie'
                ? 'NVMe / Ethernet'
                : traffic === 'display'
                  ? 'Display output'
                  : 'USB devices'}
            </small>
          </div>
        </div>
        <p className="source-note">
          USB4 is specified as a two-lane architecture that dynamically shares
          the link among data and display protocols.{' '}
          <a href="https://www.usb.org/usb4" target="_blank" rel="noreferrer">
            USB-IF source <ExternalLink size={13} />
          </a>
        </p>
      </section>

      <section className="module-surface negotiation-module">
        <div className="module-heading">
          <p className="eyebrow">Step through connection setup</p>
          <h2>
            “Negotiation” is ten coordinated stages before your dock appears.
          </h2>
        </div>
        <div className="stepper">
          <div className="step-rail">
            {negotiate.map((step, index) => (
              <button
                key={step.n}
                onClick={() => setNegotiationStep(index)}
                className={
                  index === negotiationStep
                    ? 'step-current'
                    : index < negotiationStep
                      ? 'step-done'
                      : ''
                }
              >
                <span>
                  {index < negotiationStep ? <Check size={13} /> : step.n}
                </span>
                <small>{step.title}</small>
              </button>
            ))}
          </div>
          <div className="step-detail">
            <span className="step-number">Stage {current.n} of 10</span>
            <h3>{current.title}</h3>
            <p>{current.body}</p>
            <div className="observable">
              <Activity size={16} />
              <span>
                <b>What we can observe:</b> {current.observe}
              </span>
            </div>
            <div className="step-actions">
              <Button
                variant="outline"
                disabled={negotiationStep === 0}
                onClick={() => setNegotiationStep((v) => v - 1)}
              >
                <ArrowLeft />
                Back
              </Button>
              <Button
                disabled={negotiationStep === 9}
                onClick={() => setNegotiationStep((v) => v + 1)}
              >
                Next
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="section-rule">
        <span>03</span>
        <p>Architecture review</p>
      </div>
      <section className="module" id="architecture">
        <div className="module-heading">
          <p className="eyebrow">Three ways to build it</p>
          <h2>
            Only one gives us a standards-shaped path and a credible shipping
            precedent.
          </h2>
        </div>
        <Tabs defaultValue="router" className="architecture-tabs">
          <TabsList variant="line" className="architecture-list">
            <TabsTrigger value="coupler">Transparent coupler</TabsTrigger>
            <TabsTrigger value="router">Integrated TB4 router</TabsTrigger>
            <TabsTrigger value="dual">Dual controllers</TabsTrigger>
          </TabsList>
          <TabsContent value="coupler" className="architecture-content">
            <ArchitectureCard
              status="No-go for product"
              tone="red"
              title="Raw mux between two complete cables"
              diagram={
                <>
                  <span>Host A/B</span>
                  <i>mux</i>
                  <span>cable</span>
                  <i>?</i>
                  <span>existing dock</span>
                </>
              }
              bullets={[
                'Smallest and preserves the dock’s direct PD charging path.',
                'But joins two cable assemblies into an undefined Type-C/PD topology.',
                'Consumes extra channel-loss budget with another receptacle and cable.',
                'Still useful only as a Rev 0 electrical experiment.',
              ]}
            />
          </TabsContent>
          <TabsContent value="router" className="architecture-content">
            <ArchitectureCard
              status="Conditional direction · gate closed"
              tone="green"
              title="Two selectable upstream ports feeding one real TB4 router"
              diagram={
                <>
                  <span>Host A/B</span>
                  <i>mux + PD</i>
                  <span>JHL9440</span>
                  <i>TB4</i>
                  <span>dock</span>
                </>
              }
              bullets={[
                'Matches the architecture of a certified commercial KVM dock.',
                'Terminates the upstream connection and creates a valid downstream TB4 port.',
                'Can expose three downstream TB4 ports and use the existing dock for peripherals.',
                'Requires Intel/Infineon design access and its own laptop-charging power supply.',
              ]}
            />
          </TabsContent>
          <TabsContent value="dual" className="architecture-content">
            <ArchitectureCard
              status="Future option"
              tone="amber"
              title="One Thunderbolt controller permanently attached to each host"
              diagram={
                <>
                  <span>Host A</span>
                  <i>router A</i>
                  <span>resource switch</span>
                  <i>router B</i>
                  <span>Host B</span>
                </>
              }
              bullets={[
                'Both hosts can remain enumerated and potentially powered.',
                'Fast resource switching can happen behind the controllers.',
                'More silicon, heat, firmware and PCB area.',
                'An active ATEN patent describes related topologies; legal review would be needed for commercialization.',
              ]}
            />
          </TabsContent>
        </Tabs>

        <div className="precedent-card">
          <div>
            <p className="eyebrow">Strongest precedent found</p>
            <h3>Sabrent SB-TB4K / SSI SI-452TB4</h3>
            <p>
              A teardown identifies one JHL8440 router, a PI3DBS16412 four-pair
              mux, separate USB2/SBU switching, two CCG5 PD controllers and
              protected power paths. It validates selectable upstream hosts
              before one router—not a standalone female-output coupler.
            </p>
          </div>
          <div className="precedent-links">
            <a
              href="https://www.thunderbolttechnology.net/product/ssi-tbt4-kvm-hub"
              target="_blank"
              rel="noreferrer"
            >
              Certified product listing <ExternalLink />
            </a>
            <a
              href="https://dancharblog.wordpress.com/2023/07/13/sabrent-thunderbolt-4-kvm-dock-teardown-and-review/"
              target="_blank"
              rel="noreferrer"
            >
              Independent teardown <ExternalLink />
            </a>
          </div>
        </div>
      </section>

      <section className="module-surface schematic-section">
        <div className="module-heading">
          <p className="eyebrow">
            High-level schematic · not yet a circuit diagram
          </p>
          <h2>
            The recommended system has separate data, control and power planes.
          </h2>
        </div>
        <div className="system-schematic">
          <div className="sch-column hosts">
            <Block title="Mac A USB-C" subtitle="upstream port" />
            <Block title="Mac B USB-C" subtitle="upstream port" />
          </div>
          <ArrowColumn label="CC + lanes" />
          <div className="sch-column">
            <Block
              title="Infineon CCG5"
              subtitle="attach · orientation · PD · SBU · USB2"
              kind="control"
            />
            <Block
              title="20 Gb/s 2:1 mux"
              subtitle="four differential pairs"
              kind="fast"
            />
          </div>
          <ArrowColumn label="normalized link" />
          <div className="sch-column">
            <Block
              title="Intel JHL9440"
              subtitle="TB4 / USB4 router candidate"
              kind="router"
            />
            <Block
              title="DMC + MCU"
              subtitle="sequencing · display · logs"
              kind="control"
            />
          </div>
          <ArrowColumn label="real TB4 port" />
          <div className="sch-column">
            <Block title="Downstream TB4" subtitle="to existing dock" />
            <Block
              title="20–24 V power"
              subtitle="selected-host charging + local rails"
              kind="power"
            />
          </div>
        </div>
        <div className="schematic-warning">
          <Power size={18} />
          <p>
            <b>Critical power consequence:</b> once we insert a real TB4 router,
            the downstream dock’s laptop charger does not simply pass through
            the router. The KVM needs its own power input and upstream charging
            contract. This is the biggest size/cost tradeoff versus the risky
            transparent coupler.
          </p>
        </div>
      </section>

      <div className="section-rule">
        <span>04</span>
        <p>Controller and display</p>
      </div>
      <section className="module display-module">
        <div className="module-heading">
          <p className="eyebrow">A tiny computer is useful</p>
          <h2>
            The MCU coordinates the switch; it never touches the 20 Gb/s packet
            stream.
          </h2>
          <p>
            A small OLED can show honest state and power telemetry. Live
            throughput is only possible if an Intel controller exposes counters
            or a host helper reports it.
          </p>
        </div>
        <div className="display-grid">
          <div className="device-mock">
            <div className="oled">
              <div className="oled-top">
                <span>TB4 KVM</span>
                <span className="oled-good">READY</span>
              </div>
              <div className="host-big">HOST {selectedHost}</div>
              <div className="oled-metrics">
                <span>
                  <small>MODE</small>USB4/TB
                </span>
                <span>
                  <small>POWER</small>20.1V · 2.2A
                </span>
                <span>
                  <small>SWITCH</small>2.6 sec
                </span>
                <span>
                  <small>LINK</small>HOST CHECK
                </span>
              </div>
            </div>
            <button
              className="physical-button"
              onClick={() => setSelectedHost(selectedHost === 'A' ? 'B' : 'A')}
            >
              <span />
              <b>Switch to host {selectedHost === 'A' ? 'B' : 'A'}</b>
            </button>
          </div>
          <div className="telemetry-list">
            <StatusRow
              icon={<Check />}
              title="Can show reliably"
              text="Selected host, CC attach/orientation, PD voltage/current, measured watts, faults, temperature and reconnection time."
              tone="green"
            />
            <StatusRow
              icon={<CircleAlert />}
              title="Can show conditionally"
              text="USB4/TB mode entered and 40 Gb/s link trained—only when the chosen PD/TB controller exposes supported status."
              tone="amber"
            />
            <StatusRow
              icon={<X />}
              title="Cannot measure passively"
              text="Real-time Thunderbolt throughput. An MCU cannot tap or count 20 Gb/s lane traffic through an analog mux."
              tone="red"
            />
          </div>
        </div>
        <div className="controller-sim">
          <div className="controller-sim-heading">
            <div>
              <p className="eyebrow">Press the real button, slowed down</p>
              <h3>Walk through a safe Host A → Host B handover.</h3>
            </div>
            <span>
              {controlFault
                ? 'FAULT PATH'
                : `STEP ${controlStep + 1} / ${aToBSequence.length}`}
            </span>
          </div>
          <div className="control-rail" aria-label="Controller sequence">
            {aToBSequence.map((state, index) => (
              <button
                key={state.id}
                onClick={() => {
                  setControlFault(false);
                  setControlStep(index);
                }}
                className={
                  !controlFault && controlStep === index
                    ? 'control-current'
                    : controlStep > index
                      ? 'control-done'
                      : ''
                }
                aria-label={`Show ${state.label}`}
              >
                <i />
                {state.label}
              </button>
            ))}
          </div>
          <div
            className={`control-console ${controlFault ? 'control-fault' : ''}`}
          >
            <div className="control-display">
              <small>LOCAL DISPLAY</small>
              <b>{activeControlState.display}</b>
              <span>{activeControlState.label}</span>
            </div>
            <dl className="control-flags">
              <div>
                <dt>Signal route</dt>
                <dd>{activeControlState.route}</dd>
              </div>
              <div>
                <dt>VBUS source</dt>
                <dd>{activeControlState.vbusSource}</dd>
              </div>
              <div>
                <dt>PD contract</dt>
                <dd>{activeControlState.pdContract}</dd>
              </div>
              <div>
                <dt>TB link</dt>
                <dd>{activeControlState.link}</dd>
              </div>
            </dl>
            <div className="control-evidence">
              <Gauge />
              <p>
                <small>Evidence required for this claim</small>
                {activeControlState.observable}
              </p>
            </div>
          </div>
          <div className="control-actions">
            <Button
              variant="outline"
              onClick={() => {
                setControlFault(false);
                setControlStep(0);
              }}
            >
              Reset walkthrough
            </Button>
            <Button
              variant="outline"
              className="fault-button"
              onClick={() => setControlFault(true)}
            >
              Inject fault
            </Button>
            <Button
              onClick={() => {
                setControlFault(false);
                setControlStep((controlStep + 1) % aToBSequence.length);
              }}
            >
              Next state <ArrowRight />
            </Button>
          </div>
          <p className="model-note">
            <ShieldCheck /> This demonstrator is generated from the
            machine-readable review model. Its verifier executes nine
            architectural invariants across independent A/B commands and
            readbacks. It deliberately reports integrated design authorization
            as false: downstream PD, vendor commands, thresholds and timings
            remain gated.
          </p>
        </div>
      </section>

      <div className="section-rule">
        <span>05</span>
        <p>Candidate parts</p>
      </div>
      <section className="module" id="parts">
        <div className="module-heading">
          <p className="eyebrow">Research BOM · not frozen</p>
          <h2>
            Candidate high-speed muxes exist. Exact OPNs, usable models,
            controller access and firmware remain gates.
          </h2>
        </div>
        <div className="parts-table" aria-label="Candidate components">
          <PartRow
            part="Intel JHL9440"
            job="TB4/USB4 accessory router"
            state="Access gate"
            note="Current quad-port family; public specs are insufficient for layout, NVM and firmware."
            href="https://www.intel.com/content/www/us/en/products/sku/225918/intel-jhl9440-thunderbolt-4-accessory-controller/specifications.html"
          />
          <PartRow
            part="Infineon CYPD5235 CCG5"
            job="Dual upstream CC/PD controller"
            state="Conditional research"
            note="Public dual-upstream Thunderbolt-dock application; no public proof of a ready JHL9440 combination or firmware path."
            href="https://www.infineon.com/part/CYPD5235-96BZXIT"
          />
          <PartRow
            part="TI TMUXHS4512"
            job="Select four 20 Gb/s pairs + AUX"
            state="Candidate"
            note="TB3/4 and USB4 named; about 2.5 dB insertion loss at 10 GHz; needs channel simulation."
            href="https://www.ti.com/product/TMUXHS4512"
          />
          <PartRow
            part="TI TS3USB221A"
            job="Switch USB 2 D+/D−"
            state="Candidate"
            note="Only if the accepted reference design does not use CCG5's integrated USB2/SBU routing."
            href="https://www.ti.com/product/TS3USB221A"
          />
          <PartRow
            part="RClamp01012ZC"
            job="TB4 lane ESD protection"
            state="Candidate"
            note="Two-line, 0.17 pF USB4/TB4 protection; final choice follows Intel channel approval."
            href="https://www.semtech.com/products/circuit-protection/usb/rclamp01012zc"
          />
          <PartRow
            part="TPD4S311A"
            job="CC/SBU short and ESD protection"
            state="Candidate"
            note="Reference-design conditional; CCG5 already includes relevant protection capabilities."
            href="https://www.ti.com/product/TPD4S311"
          />
          <PartRow
            part="RP2040-class MCU"
            job="Button, state machine, OLED and logs"
            state="Flexible"
            note="No high-speed role; final MCU can change without altering the Thunderbolt architecture."
            href="https://www.raspberrypi.com/products/rp2040/"
          />
          <PartRow
            part="INA238 + shunt"
            job="Host power telemetry"
            state="Optional"
            note="Lets the display show actual voltage, current and watts without claiming packet throughput."
            href="https://www.ti.com/product/INA238"
          />
          <PartRow
            part="Power subsystem"
            job="Selected-host charge and isolation"
            state="Reference design only"
            note="Back-to-back FETs, current sense, OVP/OCP and discharge must follow PD/reference guidance."
          />
        </div>
        <p className="table-footnote">
          No order should be placed for the Intel controller or production PCB
          until the developer/reference-design access gate is cleared.
        </p>
      </section>

      <div className="section-rule">
        <span>06</span>
        <p>How we prove it works</p>
      </div>
      <section className="module-surface test-section" id="test">
        <div className="module-heading">
          <p className="eyebrow">A ladder, not one magic tester</p>
          <h2>
            Functional proof is affordable. Electrical compliance belongs in a
            rented lab.
          </h2>
        </div>
        <div className="test-ladder">
          <TestLevel
            n="1"
            title="Baseline we can run now"
            cost="Existing equipment"
            items={[
              'macOS System Information confirms topology and negotiated 40 Gb/s',
              'Fast TB4 NVMe drives exercise the PCIe tunnel',
              'Displays + storage + Ethernet load several tunnels concurrently',
              'Both cable orientations, sleep/wake and repeated switching',
            ]}
          />
          <TestLevel
            n="2"
            title="Prototype bench"
            cost="Buy or borrow"
            items={[
              'USB-C/PD analyzer for attach and power messages',
              'Oscilloscope for CC/VBUS timing and discharge',
              'Electronic load/source for charging faults',
              'Thermal camera and 1,000-cycle switch fixture',
            ]}
          />
          <TestLevel
            n="3"
            title="High-speed engineering"
            cost="Rent / engage lab"
            items={[
              'Adequately ported calibrated VNA/equivalent for mixed-mode S-parameters',
              'TDR/TDT for impedance and discontinuity localization',
              'USB4/TB4 analyzer for discovery and link-training traces',
              'BERT and high-bandwidth scope for eye/jitter and receiver tolerance',
              'Intel interoperability and certification program',
            ]}
          />
        </div>
        <div className="live-proof">
          <div>
            <Gauge />
            <span>
              <b>Baseline reported · raw recapture required</b>
              <small>
                OWC Thunderbolt Dock 96W · Mode USB4 · reported Speed 40 Gb/s
              </small>
            </span>
          </div>
          <code>system_profiler SPThunderboltDataType</code>
          <p>
            This command was previously reported to return a connected OWC dock
            at 40 Gb/s, but its raw sanitized output and exact host/cable
            context were not retained. The repository therefore does not count
            it as measured evidence yet. A future recapture remains functional
            evidence, not electrical compliance.
          </p>
        </div>
        <div className="orientation-matrix">
          <h3>Minimum functional matrix</h3>
          <div>
            {[
              'Host A · plug up',
              'Host A · plug down',
              'Host B · plug up',
              'Host B · plug down',
              'Dock cable · plug up',
              'Dock cable · plug down',
              'Idle switch',
              'Switch during NVMe write',
              'Sleep / wake',
              'Cold power cycle',
              'Three cable vendors',
              '1,000 repetitions',
            ].map((item) => (
              <span key={item}>
                <Check size={13} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="module revision-section">
        <div className="module-heading">
          <p className="eyebrow">Fastest responsible revision path</p>
          <h2>
            Spend one cheap board cycle answering the existential question.
          </h2>
        </div>
        <div className="revision-path">
          <Revision
            n="0"
            title="Access + measurement gate"
            text="Register with Intel, request current router/reference collateral, obtain CCG5 firmware path, source a golden-reference KVM, and model the proposed channel."
            result="Go/no-go without fabrication"
          />
          <Revision
            n="A"
            title="Signal and control proofs"
            text="Run the RF-only mux coupon in parallel with a PD-free low-speed controller/UI board. PD/power work follows only after reference, firmware and safety gates."
            result="Measured channel evidence + verified low-speed control"
          />
          <Revision
            n="B"
            title="Integrated KVM router"
            text="Two upstream ports, one TB4 router, one downstream port, selected-host 60 W power, MCU and display header."
            result="Functional daily-use prototype"
          />
          <Revision
            n="C"
            title="Correction + enclosure"
            text="Fix measured SI/thermal/PD issues, lock the PCB outline and then build the 3D-printed mount around the proven board."
            result="Open-source release candidate"
          />
        </div>
      </section>

      <div className="section-rule">
        <span>07</span>
        <p>Before copper and plastic</p>
      </div>
      <section className="module-surface gate-section" id="gate">
        <div className="module-heading">
          <p className="eyebrow">A real stop/go gate</p>
          <h2>
            Every signal needs one owner. Every enclosure dimension needs
            evidence.
          </h2>
          <p>
            These contracts let us make progress without pretending the unknown
            controller, thermal and channel details are settled.
          </p>
        </div>
        <div className="ownership-grid">
          <Ownership
            icon={<Activity />}
            title="Four fast pairs"
            owner="20 Gb/s mux"
            safe="Disabled / high impedance"
            proof="Full S-parameter channel model"
          />
          <Ownership
            icon={<Cable />}
            title="USB2 + SBU"
            owner="Separate orientation-aware switches"
            safe="Disabled / high impedance"
            proof="Every cable orientation enumerates"
          />
          <Ownership
            icon={<ShieldCheck />}
            title="CC + VCONN"
            owner="PD policy engine"
            safe="Standards-shaped detach"
            proof="PD analyzer state traces"
          />
          <Ownership
            icon={<Power />}
            title="Host VBUS"
            owner="PD + protected back-to-back FETs"
            safe="Both host rails isolated"
            proof="Fault and discharge waveforms"
          />
        </div>
        <div className="gate-columns">
          <article className="readiness-card">
            <p className="eyebrow">Integrated-board gate</p>
            <h3>Rev B stays closed until these are evidence, not hopes.</h3>
            <ul>
              {[
                'Current Intel reference design, legal firmware/NVM path and prototype sourcing',
                'Supported Infineon dual-upstream configuration and recovery workflow',
                'Fabricator stack-up plus passing end-to-end channel simulation',
                'Reviewed power tree proving Host A and Host B can never share VBUS',
                'Your approval of charging wattage, detach behavior, switch time and display scope',
              ].map((item) => (
                <li key={item}>
                  <CircleAlert />
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <article className="mechanical-card">
            <p className="eyebrow">Mechanical contract</p>
            <h3>
              Three replaceable layers prevent one revision becoming three.
            </h3>
            <div className="mechanical-stack">
              <span>
                <b>Control pod</b>
                <small>button + optional display</small>
              </span>
              <i />
              <span>
                <b>Electronics tray</b>
                <small>proven PCB + thermal path</small>
              </span>
              <i />
              <span>
                <b>Mount adapter</b>
                <small>desk / under-desk / rail</small>
              </span>
            </div>
            <p>
              Connector faceplates stay replaceable. Final hole positions, vents
              and enclosure volume come from the released PCB STEP model and
              measured thermal map—not estimated dimensions.
            </p>
          </article>
        </div>
        <div className="gate-verdict">
          <Check />
          <p>
            <b>Allowed now:</b> documentation, controller-access work, channel
            models, test fixtures, supported evaluation boards and measurement
            coupons. <b>Still gated:</b> an integrated production schematic, PCB
            outline and finished enclosure.
          </p>
        </div>
      </section>

      <div className="section-rule">
        <span>08</span>
        <p>Terminology and evidence</p>
      </div>
      <section className="module glossary-section" id="glossary">
        <div className="module-heading">
          <p className="eyebrow">Plain-English glossary</p>
          <h2>Search every term used in this review.</h2>
        </div>
        <label className="glossary-search">
          <Search />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try “retimer”, “CC”, “lane”…"
          />
          <span>{filteredGlossary.length} terms</span>
        </label>
        <Accordion className="glossary-list">
          {filteredGlossary.map(([term, meaning]) => (
            <AccordionItem key={term} value={term}>
              <AccordionTrigger>{term}</AccordionTrigger>
              <AccordionContent>{meaning}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="module-surface sources-section">
        <div className="module-heading">
          <p className="eyebrow">Evidence trail</p>
          <h2>Primary specifications first; teardown evidence is labeled.</h2>
        </div>
        <div className="source-grid">
          {sources.map(([name, use, href]) => (
            <a key={name} href={href} target="_blank" rel="noreferrer">
              <span>
                <b>{name}</b>
                <small>{use}</small>
              </span>
              <ExternalLink />
            </a>
          ))}
        </div>
      </section>

      <footer>
        <div>
          <span className="brand-mark">
            <GitBranch size={18} />
          </span>
          <span>
            <b>TB4 KVM Field Guide</b>
            <small>Research review before PCB design</small>
          </span>
        </div>
        <p>
          Next gate: agree an adequately ported calibrated VNA/lab method and a
          frozen PCBWay stack-up for the measurement-only PCB-1A coupon; the
          integrated router remains blocked.
        </p>
      </footer>
    </main>
  );
}

function ArchitectureCard({
  status,
  tone,
  title,
  diagram,
  bullets,
}: {
  status: string;
  tone: string;
  title: string;
  diagram: React.ReactNode;
  bullets: string[];
}) {
  return (
    <article className={`architecture-card tone-${tone}`}>
      <div className="architecture-copy">
        <span className="architecture-status">{status}</span>
        <h3>{title}</h3>
        <ul>
          {bullets.map((item) => (
            <li key={item}>
              <ChevronRight />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="architecture-diagram">{diagram}</div>
    </article>
  );
}
function Block({
  title,
  subtitle,
  kind = 'normal',
}: {
  title: string;
  subtitle: string;
  kind?: string;
}) {
  return (
    <div className={`sch-block sch-${kind}`}>
      <b>{title}</b>
      <small>{subtitle}</small>
    </div>
  );
}
function ArrowColumn({ label }: { label: string }) {
  return (
    <div className="sch-arrow">
      <span>{label}</span>
      <i />
      <ArrowRight />
    </div>
  );
}
function StatusRow({
  icon,
  title,
  text,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  tone: string;
}) {
  return (
    <div className={`status-row status-${tone}`}>
      <span>{icon}</span>
      <div>
        <b>{title}</b>
        <p>{text}</p>
      </div>
    </div>
  );
}
function PartRow({
  part,
  job,
  state,
  note,
  href,
}: {
  part: string;
  job: string;
  state: string;
  note: string;
  href?: string;
}) {
  return (
    <div className="part-row">
      <div>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer">
            {part}
            <ExternalLink />
          </a>
        ) : (
          <b>{part}</b>
        )}
        <small>{job}</small>
      </div>
      <span>{state}</span>
      <p>{note}</p>
    </div>
  );
}
function TestLevel({
  n,
  title,
  cost,
  items,
}: {
  n: string;
  title: string;
  cost: string;
  items: string[];
}) {
  return (
    <article>
      <span className="test-n">{n}</span>
      <div>
        <p className="test-cost">{cost}</p>
        <h3>{title}</h3>
        <ul>
          {items.map((item) => (
            <li key={item}>
              <Check />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
function Revision({
  n,
  title,
  text,
  result,
}: {
  n: string;
  title: string;
  text: string;
  result: string;
}) {
  return (
    <article>
      <span>{n}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
        <small>{result}</small>
      </div>
    </article>
  );
}
function Ownership({
  icon,
  title,
  owner,
  safe,
  proof,
}: {
  icon: React.ReactNode;
  title: string;
  owner: string;
  safe: string;
  proof: string;
}) {
  return (
    <article>
      <span>{icon}</span>
      <h3>{title}</h3>
      <dl>
        <div>
          <dt>Owner</dt>
          <dd>{owner}</dd>
        </div>
        <div>
          <dt>Reset state</dt>
          <dd>{safe}</dd>
        </div>
        <div>
          <dt>Proof</dt>
          <dd>{proof}</dd>
        </div>
      </dl>
    </article>
  );
}
