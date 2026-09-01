# PD-free controller prototype

**Status: prototype only.** This is a deterministic host-executable model for the small, low-speed control experience proposed in issue #18. It models user-facing selection requests and conservative fail-closed supervision. It is not electrical evidence and does not select, power, negotiate with, time, or otherwise control any Type-C, USB-PD, VBUS, high-speed, or storage hardware.

## What it answers

The prototype makes the provisional interaction testable before a controller is chosen:

- Startup prefers Host A; Host B is selected only when it is the sole attached host. With neither host attached, nothing is selected.
- The remote pod is optional and request-only. Its removal does not remove onboard control, and it cannot confirm a switch.
- A stable onboard press requests a host change and shows a `STOP / EJECT STORAGE` acknowledgement. A deliberate **onboard hold** confirms it. Defaults are a 30 ms debounce, 900 ms hold, and a five-second confirmation deadline. These are configurable model values, not firmware or hardware timing claims.
- If the active host disappears, the controller stays in an honest waiting state. It does not automatically fail over to the other host. A later deliberate request chooses the currently attached candidate using the startup rule: A when A is attached, otherwise B when B is the sole candidate.
- A target disappearing before confirmation or a timeout cancels selection conservatively. External-power loss and brownout mark external power unavailable and block startup until `POWER_RESTORED`, then require an explicit startup. A watchdog reset retains its observed power state but also requires explicit startup.
- A fault latches the model in isolation. Power, reset, startup, button, and pod events may be recorded as observations but cannot clear it. This prototype recovers a fault only by constructing a fresh controller/power-cycle model; `FAULT_CLEAR` is deliberately not an unlatch command.

The one-button request-then-hold gesture is deliberately reversible provisional behavior. It records that storage-stop/eject acknowledgement was requested; it cannot establish that a real host has stopped storage or that any hardware path is safe.

## Run it

From the repository root:

```sh
node firmware/controller-prototype/test.mjs
node firmware/controller-prototype/demo.mjs switch-with-hold
node firmware/controller-prototype/demo.mjs b-only
```

The demo prints each model step as JSON: its mode, a minimal truthful LED/display label, and only abstract intents such as `SELECT_HOST_INTENT`, `ISOLATE_INTENT`, and `REQUEST_STORAGE_STOP_EJECT`.

## Files and boundaries

| File                                         | Purpose                                                                            |
| -------------------------------------------- | ---------------------------------------------------------------------------------- |
| `firmware/controller-prototype/model.mjs`    | Pure state machine; no device I/O, driver, protocol, PD, VBUS, or high-speed code. |
| `firmware/controller-prototype/test.mjs`     | Data-driven and randomized adversarial checks, including bounded logs and intents. |
| `firmware/controller-prototype/demo.mjs`     | Small CLI walkthrough for trying named scenarios.                                  |
| `design/controller-prototype/scenarios.json` | Named initial conditions and event sequences.                                      |

The "selected" labels mean only that the model emitted an abstract request. They do not mean a cable path exists, a link is ready, USB storage is quiesced, a dock negotiated power, or a safety/compliance condition has been proved. Hardware implementation requires separately reviewed electrical architecture, evidence, validation, and owner decisions.
