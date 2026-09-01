# Owner purchase-preparation checklist — issue 18

This checklist prepares an approval request. It does not place an order, create a cart, contact a vendor or authorize a substitution. All prices and stock are dated snapshots captured 2026-09-01; re-check them when the owner is ready.

## First: check the bench drawer

- [ ] Pico 2 board: exact marking `SC1631` preferred, or `SC1632` with headers.
- [ ] One solderless breadboard with intact contacts and a separate power-rail area. Preferred exact new item: BusBoard `BB830`.
- [ ] Two through-hole SPST-NO dry-contact buttons. Preferred exact part: Omron `B3F-1000`.
- [ ] 1 kΩ resistors: four, 0.25 W or better; 10 kΩ resistors: four; 100 kΩ resistors: two.
- [ ] One 0.1 µF (100 nF) X7R through-hole capacitor, 50 V or better.
- [ ] A 3.3 V-compatible I²C display. Preferred exact item: Adafruit product ID `938`.
- [ ] One red/green diagnostic LED. Preferred exact item: Kingbright `WP59EGW/CA`.
- [ ] Color-coded 0.1 in jumper wires; preferred exact item: Adafruit product ID `1957`.
- [ ] 3.3 V UART logger with TX/RX/GND and a removable/unused VCC lead. Preferred exact item: FTDI `TTL-232R-3V3`.
- [ ] A regulated, current-limited supply that can be set to 3.3 V and 100 mA. The pack hard limit is 250 mA.
- [ ] DMM with a DC voltage range covering 0–5.5 V (a 6 V range is convenient), continuity and resistance.
- [ ] Optional scope or logic analyzer for GP8, bounce and power-ramp traces; no purchase is required for the base build.
- [ ] Plan B9/B10 evidence as two labelled sequential runs: FTDI serial/reset-cause logs with USB-powered setup, then direct-VSYS waveform/current evidence with both Pico and FTDI USB cables unplugged.

## If a line is missing

- [ ] Record the exact manufacturer and MPN/order code in the owner notes before asking for approval.
- [ ] Re-open the manufacturer source and the dated distributor snapshot in `acquisition.inventory.json`.
- [ ] Confirm the physical variant: SC1631 versus SC1632, display connector/pull-ups, LED common-anode pinout, resistor lead form, capacitor lead spacing, UART voltage and supply plug.
- [ ] Confirm the seller is the manufacturer or a named authorized distributor. Do not use broker stock or an unmarked assortment for acceptance evidence.
- [ ] Record actual unit price, currency, tax, freight, stock state, lead time and any minimum pack quantity. Treat the stored price as a planning range only.
- [ ] Ask the owner for explicit purchase approval. Stop if approval would add a target MacBook, dock, USB-C/PD/VBUS/Thunderbolt/high-speed equipment or any product-power connection.

## Do not buy yet

- [ ] Nexperia `PESD3V3U1UL,315`: optional reviewed-later SMD protection candidate for an exposed remote cable; current DigiKey snapshot is out of stock. Do not connect a remote cable in the base build; exercise the second request input with an adjacent breadboard button.
- [ ] Any charger, USB-C/PD trigger, dock, host laptop, Thunderbolt analyzer, router/mux board or product harness: explicitly excluded from this issue.

## After approval and receipt

- [ ] Photograph packaging and record received MPN, quantity, date code/lot where available.
- [ ] Do not silently substitute. Re-run `node design/controller-bench/acquisition.validate.mjs` after any inventory change.
- [ ] Follow the USB programming → disconnect both ends → DMM VBUS check → current-limited VSYS sequence in the acquisition README.
