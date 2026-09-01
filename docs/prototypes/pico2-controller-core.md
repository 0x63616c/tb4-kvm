# Pico 2 controller core (host-tested)

**Status: prototype only.** This directory is the first embedded-shaped follow-on to the JavaScript control model. It is deliberately a small portable C state machine; no Pico SDK, GPIO, USB-C, USB-PD, VBUS, Thunderbolt/USB4, mux, retimer, storage, or power-path code exists here.

The `pico2` name means the proposed bench target is Raspberry Pi Pico 2. It does **not** claim that this source has been flashed, that a Pico 2 has been acquired, or that it has touched the isolated bench.

## Contract

`firmware/controller-pico2/controller_core.{c,h}` represents only low-speed observations and abstract intents:

- Startup chooses A when present, B only when A is absent, and no host when neither is present.
- Removing the selected host enters a waiting state; it never auto-fails over.
- An onboard press (30 ms debounce by default) requests a switch. A separate 900 ms onboard hold confirms it. The optional pod can request but cannot confirm.
- Timeout or a stale target fails closed: no stale selection intent is emitted.
- Power loss and brownout isolate. Recovery needs observed restored power and explicit startup. A watchdog reset isolates until explicit startup.
- A fault latches isolation; later power, reset, startup, button, and pod events cannot clear it.
- Event logs and abstract intent histories have fixed compile-time storage and bounded configured retention. The core allocates no memory.

An `INTENT_SELECT_HOST` is a request at an as-yet-unimplemented electrical boundary. It is not a mux command, PD decision, cable-path change, proof of storage quiescence, or a claim that a host or dock is electrically connected.

## Host test

From the repository root, run:

```sh
firmware/controller-pico2/test-host.sh
```

The script uses the system `cc` (or `CC` if set), compiles C11 with warnings treated as errors, runs deterministic tests, then deletes the temporary binary. It covers startup A/B/neither, no automatic failover, request/hold confirmation, pod request-only behavior, stale target refusal, power/brownout/watchdog recovery, fault dominance, invariants, and fixed bounded logs/intents.

## Integration boundary

This source remains intentionally separate from the validated production controller design. Before any hardware integration, we need an independent code review, a named Pico SDK/toolchain release, reviewed pin/IO ownership, and proof that all low-speed inputs and outputs stay behind the isolated controller boundary documented in the bench plan. The physical B1–B13 bench evidence is still not collected.

The host test is part of the repository's mandatory `npm run check` gate.
