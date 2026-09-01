# Architecture decision: selectable upstream TB4 router

## Decision

Use two managed upstream USB-C ports feeding one 40 Gb/s high-speed selector and one real Thunderbolt 4 accessory router. Expose a real downstream Thunderbolt port for the existing dock.

Do not make the final product a transparent three-receptacle coupler placed between two complete USB-C cable assemblies.

## Why

A commercial precedent exists. The Sabrent SB-TB4K / SSI SI-452TB4 teardown identifies:

- one Intel JHL8440 Thunderbolt 4 router;
- one PI3DBS16412 2:1 mux for the four USB4/TB4 differential pairs;
- separate USB2/SBU switching;
- two Infineon CYPD5235 PD controllers;
- protected VBUS switching and monitoring.

The two selected upstreams sit before the router. The router then creates standards-shaped downstream ports.

Infineon independently documents CYPD5235 in a dual-upstream Thunderbolt dock application. It manages attach, orientation, PD, USB2, SBU link-management routing, power control, and communication with the Thunderbolt controller.

## Rejected product architecture: transparent coupler

```text
Host cable ── receptacle ── mux ── receptacle ── second cable ── dock
```

Problems:

- It joins two separately identified cable assemblies in one path.
- CC, VCONN and cable-marker messaging do not become valid merely because the four fast pairs are switched.
- Three independent reversible receptacles require orientation-aware mapping.
- Another connector and cable consume channel-loss budget.
- A retimer can improve signal margin but cannot repair an invalid CC/PD topology.
- USB-IF does not define a passive female-to-female USB-C extension assembly as a compliant cable assembly.

It may still be useful as a deliberately limited signal-integrity coupon, but not as the promised product.

## Alternative: dual Thunderbolt controllers

One controller per host can keep both hosts enumerated while switching resources behind them. It increases heat, cost, layout complexity, firmware dependency and potential patent exposure. It is reserved for a future version only if continuous host attachment becomes a requirement.

## Consequences

- The KVM is effectively a small TB4 dock/router, not a transparent extension switch.
- It needs its own always-on supply and must negotiate charging with the selected host.
- The existing downstream dock's laptop-charging power does not simply pass through the TB4 router.
- The MCU coordinates state but does not touch Thunderbolt packets.
- Intel and Infineon firmware/reference material become hard dependencies.

## Primary evidence

- [USB4 overview](https://www.usb.org/usb4)
- [Intel JHL9440](https://www.intel.com/content/www/us/en/products/sku/225918/intel-jhl9440-thunderbolt-4-accessory-controller/specifications.html)
- [Infineon CCG5 datasheet](https://www.infineon.com/assets/row/public/documents/24/49/infineon-ez-pd-ccg5-usb-type-c-port-controller-datasheet-en.pdf)
- [SSI certified KVM hub](https://www.thunderbolttechnology.net/product/ssi-tbt4-kvm-hub)
- [Sabrent KVM teardown](https://dancharblog.wordpress.com/2023/07/13/sabrent-thunderbolt-4-kvm-dock-teardown-and-review/)
