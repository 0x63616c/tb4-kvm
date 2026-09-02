# Transparent USB-C mux prototype: what can work and what cannot

Status: `PROPOSED` teaching and experiment boundary. No transparent-mux PCB has been built.

## Short answer

A high-speed analog mux **can carry the four USB4/Thunderbolt differential pairs**. The candidate TI `TMUXHS4512` is specified for six routed channels and up to 20 Gb/s per high-speed channel, so its four main differential paths are fast enough on paper for the four fast pairs used by a USB4 40 Gb/s link.

That does **not** make a three-receptacle, 24-pin “wire everything through” board a complete USB-C switch. USB-C is several electrical systems sharing one connector. The fast mux handles only one of them, and a receptacle-to-receptacle box joining two plug-to-plug cables is not one of the cable topologies defined by the USB Type-C specification.

Our product architecture still uses a high-speed mux. The rejected idea is putting that mux transparently between two complete cable assemblies without a real Type-C/PD and Thunderbolt/USB4 port architecture.

## First correct the bandwidth arithmetic

USB4 40 Gb/s uses two lanes, each signaling at up to 20 Gb/s. Each lane has a transmit differential pair and a receive differential pair, so the connector exposes four fast differential pairs in total:

```text
lane 0: TX0±  and RX0±
lane 1: TX1±  and RX1±
```

The advertised link rate is **40 Gb/s**, not 80 Gb/s obtained by adding all four one-way pairs. A “20 Gb/s channel” mux rating means that one differential path can pass one of those serial pairs. Four such fast paths are required for USB4 40 Gb/s.

## Why 24 contacts are not 24 ordinary wires

The receptacle contacts belong to different systems:

| Contact group | What it does | What a transparent switch must do |
|---|---|---|
| Four fast differential pairs | USB4/TB link data | Route four impedance-controlled paths with the correct orientation and enough channel margin |
| D+ / D− | USB 2 fallback and management uses | Route separately; do not assume the fast mux covers it |
| SBU1 / SBU2 | USB4 sideband or alternate-mode signals | Route with orientation-aware ownership |
| CC1 / CC2 | Attach detection, plug orientation, roles, current advertisement, USB PD communication | Preserve a valid Type-C state machine for each receptacle; never treat as ordinary data wires |
| VCONN | Powers cable electronics on the unused CC contact | Supply and isolate only as the Type-C/PD policy permits |
| VBUS | Up to high power, depending on a valid negotiated contract | Switch with protected power FETs, reverse-current blocking, discharge and fault handling |
| Ground and shell | Signal/power return and shielding | Maintain controlled return paths and a reviewed shield strategy |

## Failure 1: two receptacles create two independent plug orientations

A normal full-featured C-to-C cable has a plug at each end and one through-going CC wire. A receptacle exposes both `CC1` and `CC2`; the attached plug orientation decides which one reaches the cable's CC wire. The other contact can become VCONN for cable electronics.

With two female receptacles joined by a board, the two cable plugs can be flipped independently:

```text
left cable uses CC1     right cable uses CC1     straight CC1→CC1 can work
left cable uses CC1     right cable uses CC2     straight CC1→CC1 is open
left cable uses CC2     right cable uses CC1     straight CC2→CC2 is open
left cable uses CC2     right cable uses CC2     straight CC2→CC2 can work
```

Simply tying `CC1` and `CC2` together is not the fix: it destroys the distinction used for orientation and can join a CC/PD path to a VCONN-powered contact. A correct product must give every receptacle a valid Type-C/PD port implementation; merely relaying two independently flippable cable contacts does not create one legal cable.

The fast pairs and SBU signals have the same independent-orientation problem. A fixed 1:1 mapping is only correct for some combinations. An orientation-aware crossbar or equivalent supported topology is required.

## Failure 2: the mux cannot negotiate or safely switch power

The high-speed mux is an analog path selector. It does not:

- advertise or detect Type-C source/sink roles;
- exchange USB Power Delivery messages;
- discover and power an e-marked cable;
- decide which plug contact is CC versus VCONN;
- switch or protect VBUS;
- stop Host A VBUS from meeting Host B VBUS;
- tell the Thunderbolt/USB4 link to detach, retrain or enumerate.

Those jobs require Type-C/PD controllers, protected power paths and a coordinated break-before-make state machine. A microcontroller may coordinate documented controllers, but it does not process the 20 Gb/s serial data.

USB4 entry is especially important here: the ports first establish a power contract, then discover the port partner and the cable over USB PD, and then send `Enter_USB` messages. Two independently e-marked cables separated by a transparent box do not automatically appear as one valid cable identity. If discovery or entry fails, the endpoints may fall back or provide no usable high-speed link.

## Failure 3: two cables plus the board consume the electrical margin

USB4 Gen 3 reaches 40 Gb/s using two 20 Gb/s lanes. USB-IF's electrical overview gives a representative Gen 3 passive-cable limit of 0.8 m and 7.5 dB insertion loss at 10 GHz. A transparent extension path adds:

```text
host port
  + cable 1
  + plug/receptacle interface
  + PCB traces/vias/ESD
  + mux package
  + second receptacle/plug interface
  + cable 2
  + dock port
```

The mux alone is typically specified at about 2.5 dB insertion loss at 10 GHz. The complete path, not the mux headline, determines whether training has enough eye and jitter margin. Very short cables and an excellent RF layout might train; ordinary cables can fall back or fail.

## What a raw-mux experiment could realistically prove

A deliberately limited, externally powered experiment could include:

1. four fast-pair 2:1 paths;
2. separate USB2 and SBU switching;
3. orientation detection/mapping for all three receptacles;
4. one independent Type-C/PD policy domain per receptacle;
5. protected, mutually exclusive VBUS paths;
6. break-before-make control and safe reset defaults;
7. very short known cables and RF test fixtures.

Possible observed outcomes are:

| Outcome | Meaning |
|---|---|
| USB4/TB4 link at 40 Gb/s | This exact host, dock, cables and board trained at Gen 3; it does not prove compliance or margin |
| USB4 link at 20 Gb/s | The system negotiated/fell back to the lower link rate |
| USB 3 / USB 2 only | Type-C attachment worked, but USB4/TB discovery or signal training did not |
| No attach or intermittent reconnects | CC/orientation/power sequencing or channel integrity is invalid |

It would be a useful learning and measurement coupon, but it would already be much more than “24 traces plus one mux.” It would not be the promised reliable KVM product.

A first **PD-free RF coupon** may characterize only the mux, connector launches and PCB traces using suitable RF fixtures. It must not connect laptops, the dock, a charger or exposed VBUS. Connecting valuable USB-C equipment waits until CC/PD/VCONN behavior and protected power paths are designed and reviewed.

## What breakout would actually be cable-equivalent?

There is no ordinary 24-pin header breakout that remains cable-equivalent at TB4 speed. Pin headers, long stubs and uncontrolled traces are unsuitable for a 20 Gb/s-per-lane channel.

The closest physical form is a deliberately engineered active cable/interposer with USB-C **plugs**, not a female-to-female extension:

```text
Host receptacle ← captive plug/cable ─ controlled PCB ─ captive plug/cable → dock receptacle
```

For two hosts it becomes a three-tail switched assembly:

```text
Host A ← captive plug/cable ─┐
                             ├─ switch/interposer ─ captive plug/cable → dock
Host B ← captive plug/cable ─┘
```

This removes the two extra receptacles and lets the designer control the complete cable construction, orientation mapping and loss. It still needs a valid cable identity/e-marker strategy, protected power behavior and a proven complete channel. A two-input switched cable is not itself a standard USB-C cable topology, so successful training with chosen equipment would remain experiment evidence, not compliance proof.

For measurement rather than use as a cable, the equivalent “breakout” is a high-frequency compliance fixture or analyzer interposer with calibrated RF launches. It is not a row of 2.54 mm headers and it is not intended to carry laptop charging power by default.

## Why the integrated product puts the mux before a router

```text
Host A ─┐
        ├─ managed Type-C/PD + fast-pair mux ─ TB4 router ─ real downstream TB4 port ─ dock
Host B ─┘
```

The mux still selects which host's physical lanes reach the router. The Type-C/PD controllers own attachment, orientation and power. The router terminates the selected upstream link and creates/trains a separate downstream link instead of pretending two cable assemblies are one cable. Switching is therefore an intentional detach/reconnect/re-enumeration event, not a seamless handover.

This costs more power, board area, controlled firmware/reference material and engineering effort. It is also the architecture with a credible path to repeatable TB4 behavior.

## Primary sources

- [USB-IF USB Type-C System Overview](https://www.usb.org/sites/default/files/D1T1-2%20-%20USB%20Type-C%20System%20Overview.pdf) — functional cable/CC/orientation model.
- [USB-IF USB Type-C Cable and Connector Specification](https://www.usb.org/usb-type-cr-cable-and-connector-specification) — connector, cable, discovery and configuration definitions.
- [USB-IF USB4 Electrical Layer](https://www.usb.org/sites/default/files/D1T1-4%20-%20USB4%20Electrical%20Layer.pdf) — dual-lane 40 Gb/s operation and representative Gen 3 channel/cable limits.
- [TI TMUXHS4512 product page and datasheet](https://www.ti.com/product/TMUXHS4512) — analog mux scope, channel count, data-rate and insertion-loss specifications.
- [Infineon EZ-PD CCG5 datasheet](https://www.infineon.com/assets/row/public/documents/24/49/infineon-ez-pd-ccg5-usb-type-c-port-controller-datasheet-en.pdf) — example of the separate Type-C/PD, orientation and dock-control responsibilities.
