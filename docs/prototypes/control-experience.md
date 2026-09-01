# Control-experience prototype

Status: `PROTOTYPE` — a throwaway UI/control exploration for issue #17, not
electrical design evidence or a decision to close the issue.

Question: can a beginner-facing main-unit control experience make host choice,
storage interruption, isolation, fault states and the optional remote pod
understandable without suggesting that the electrical design is already proven?

The prototype is mounted in the existing field guide at `#control-experience`.
It starts with both hosts attached and chooses Host A; it chooses Host B only
when B is the sole attached host. Removing the active host never fails over
automatically: the user must request a switch. A switch presents a stop/eject
storage warning before confirmation. Power loss and fault simulations isolate
both paths in the presentation.

It compares an LED-minimal surface with a small display, retains the main-unit
button when the optional pod is absent, and treats the pod as a request-only
low-speed accessory. It intentionally makes no claim about Type-C/PD timing,
VBUS safety, controller status, link training, bandwidth, compliance or
readiness. Any accepted product behaviour still requires the owner decision,
reference-backed electrical design and validation evidence.
