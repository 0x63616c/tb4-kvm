# Pico 2 controller core (host-tested)

**Status: prototype only.** This directory is the first embedded-shaped follow-on to the JavaScript control model. The portable C state machine remains separate from the named, pinned Pico SDK build binding. That binding emits an intentionally inert Pico 2 image only; it adds no GPIO, display, UART, USB-C, USB-PD, VBUS, Thunderbolt/USB4, mux, retimer, storage, or power-path control code.

The `pico2` name means the proposed bench target is Raspberry Pi Pico 2. It does **not** claim that this source has been flashed, that a Pico 2 has been acquired, or that it has touched the isolated bench. See the [pinned SDK binding README](../../firmware/controller-pico2/README.md) for the software-only CMake setup.

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

`firmware/controller-pico2/low_speed_frontend.{c,h}` adds a portable,
null-backed diagnostic boundary. It converts already-normalized logical local
and request-only pod button samples into the existing core events, retains
bounded raw-edge and accepted-press records, and projects only `BOOT`,
`NO_HOSTS`, `REQUEST`, and `FAULT` diagnostics. It has no Pico SDK dependency,
pin mapping, display protocol, UART transport, or intent-output callback. It
cannot use GPIO-like input as host discovery or drive a selection/power/data
action.

The frontend accepts a monotonic sample timestamp only when its forward gap is
at most `UINT32_MAX` milliseconds. A larger gap is rejected before advancing
the core or changing any frontend state; this keeps each accepted sample's
elapsed time representable by one core `TICK` event.

## Host test

From the repository root, run:

```sh
firmware/controller-pico2/test-host.sh
```

The script uses the system `cc` (or `CC` if set), compiles C11 with warnings treated as errors, runs deterministic tests, then deletes the temporary binary. It covers startup A/B/neither, no automatic failover, request/hold confirmation, pod request-only behavior, stale target refusal, power/brownout/watchdog recovery, fault dominance, invariants, fixed bounded logs/intents, and the null-backed frontend's raw/debounced records, the `UINT32_MAX`/`UINT32_MAX + 1` forward-gap boundary, unchanged-state rejection, and no-selection boundary.

## Integration boundary

This source remains intentionally separate from the validated production controller design. The named Pico SDK/toolchain release is now pinned in the [Pico 2 binding](../../firmware/controller-pico2/README.md), but the target has no hardware I/O adapter and remains inert. The null-backed frontend is a portable compile/test seam, not a GPIO/display/UART implementation. Before any hardware integration, we still need reviewed pin/IO ownership and proof that all low-speed inputs and outputs stay behind the isolated controller boundary documented in the bench plan. The physical B1–B13 bench evidence is still not collected.

The inert Pico binding keeps the approximately 2.1 KiB frontend object in
file-scope static/BSS storage rather than automatic `main()` stack storage.
`test-host.sh` verifies that declaration at source level; this is not runtime
stack-usage evidence. The optional `firmware/controller-pico2/test-host-ubsan.sh`
uses the retained C11/strict-warning/UndefinedBehaviorSanitizer command and
expects `controller-pico2-low-speed-frontend: 39 checks passed`; it is separate
from the mandatory host test because sanitizer support varies by compiler.

The host test is part of the repository's mandatory `npm run check` gate.
