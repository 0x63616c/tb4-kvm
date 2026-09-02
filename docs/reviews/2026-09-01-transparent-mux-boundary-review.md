# Transparent mux teaching boundary review

- Date: 2026-09-01
- Author: primary project agent
- Independent reviewer: `ctrl1a_release_review`
- Scope: `docs/decisions/2026-09-01-transparent-mux-prototype-boundary.md`, the linked architecture decision, and the website's transparent-coupler summary
- Result: `REVIEWED` after dispositions below; this is a documentation review, not electrical approval

## Findings and dispositions

| Severity | Finding | Disposition |
|---|---|---|
| P1 | Do not imply that a raw mux is impossible; distinguish an electrically plausible fast-pair switch from an undefined three-receptacle Type-C cable topology. | Corrected. The note and site now say the mux can pass the four fast paths on paper while the transparent cable topology remains invalid as a product assumption. |
| P1 | Do not claim that the transparent path preserves the dock charging path. USB4 entry depends on valid attach, PD contract, cable discovery, VCONN and `Enter_USB`; two cable identities do not automatically become one. | Corrected. The charging claim was removed and cable discovery/identity was added. |
| P1 | A fast-pair mux does not cover USB2, SBU, orientation, CC/PD, VCONN or protected/reverse-blocked VBUS. | Corrected. These are listed as separate owned systems and Host A/Host B VBUS isolation remains explicit. |
| P2 | A 20 Gb/s mux rating is per routed differential path, not total KVM throughput or an 80 Gb/s sum. | Corrected. The note explains two 20 Gb/s lanes and the four TX/RX differential paths without adding them into a false user-throughput number. |
| P1 | Do not invite valuable-equipment testing as a “Rev 0 electrical experiment.” | Corrected. The first allowed experiment is now a PD-free RF coupon/fixture with no laptop, dock, charger or exposed VBUS connection. |
| P2 | Describe a managed router as terminating/creating trained links and switching as detach/reconnect/re-enumeration, not seamless handover. | Corrected. |

## Evidence reviewed

- [USB-IF USB Type-C System Overview](https://www.usb.org/sites/default/files/D1T1-2%20-%20USB%20Type-C%20System%20Overview.pdf)
- [USB-IF USB Type-C Cable and Connector Specification](https://www.usb.org/usb-type-cr-cable-and-connector-specification)
- [USB-IF USB4 Electrical Layer](https://www.usb.org/sites/default/files/D1T1-4%20-%20USB4%20Electrical%20Layer.pdf)
- [USB-IF USB4 overview](https://www.usb.org/usb4)
- [TI TMUXHS4512](https://www.ti.com/product/TMUXHS4512)
- [Infineon EZ-PD CCG5](https://www.infineon.com/products/universal-serial-bus/usb-c-power-delivery-controllers/ez-pd-ccg5-ccg5c-dual-single-port-usb-c-pd)
- [Intel JHL9440](https://www.intel.com/content/www/us/en/products/sku/225918/intel-jhl9440-thunderbolt-4-accessory-controller/specifications.html)

## Boundary

This review supports the accuracy of the beginner-facing explanation. It does not approve a transparent-mux PCB, authorize connection to equipment, close the integrated schematic gate or prove Thunderbolt/USB4 compliance.
