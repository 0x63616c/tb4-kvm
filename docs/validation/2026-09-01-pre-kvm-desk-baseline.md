# Pre-KVM desk baseline capture

Status: **BLOCKED — partial topology capture only; not a complete measured baseline**

The documented baseline procedure requires the Thunderbolt topology plus dock,
display, storage, Ethernet, USB behavior, sleep/wake and power-cycle context,
with exact host/cable models and lengths. A read-only, sanitized literal
`system_profiler SPThunderboltDataType` capture was possible and shows the named
OWC Thunderbolt Dock 96W connected in USB4 mode at 40 Gb/s. The sanitized literal command output is
retained in [`evidence/2026-09-01-pre-kvm-desk-baseline-system-profiler.txt`](../../evidence/2026-09-01-pre-kvm-desk-baseline-system-profiler.txt).

Absent from this owner-less capture: exact host identity/model context beyond
the generic profiler label, cable models and lengths, display behavior,
storage behavior, Ethernet behavior, USB behavior, sleep/wake results and
power-cycle results. No hardware state was changed and no KVM was connected.

Conclusion: this is useful topology evidence but does not satisfy the complete
pre-KVM acceptance procedure and must not be promoted to `MEASURED` or used as
proof of electrical compliance. Safe owner pickup: record the missing desk
context and run the documented display/storage/Ethernet/USB, sleep/wake and
power-cycle observations before KVM bring-up.
