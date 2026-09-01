# Issue 18 controller-bench acquisition/build pack

Status: **PROPOSED — prepared, not ordered** (captured 2026-09-01).

This is a small, disposable low-speed bench for the controller behavior in issue #18: buttons, debounce, request-only remote input, diagnostic display/LEDs, watchdog, brownout/power-loss handling, ADC observation and serial event logs. It is deliberately not a KVM, dock, host, charger or product-power test.

The machine-readable source of truth is [`acquisition.inventory.json`](../../../../design/controller-bench/acquisition.inventory.json). Run [`acquisition.validate.mjs`](../../../../design/controller-bench/acquisition.validate.mjs) after editing it. The JSON Schema is [`acquisition.schema.json`](../../../../design/controller-bench/acquisition.schema.json). The owner-only purchase preparation list is [`OWNER-PURCHASE-CHECKLIST.md`](OWNER-PURCHASE-CHECKLIST.md).

## Hard boundary

Do not bring a target MacBook, dock, USB-C cable/receptacle, PD/CC/VBUS/VCONN wiring, Thunderbolt/router/mux circuitry, high-speed signal, charger, or product board into this bench. The Pico micro-USB cable is permitted only for programming and setup. It must be removed at both ends before direct VSYS testing. An FTDI cable is a 3.3 V UART logger, not a power source: connect GND/TX/RX only and leave its VCC pin floating.

The only powered circuit is the Pico 2 and its 3.3 V peripherals. Keep the bench at 3.3 V nominal, never above 5.5 V, and use a hard supply current limit of 250 mA. Start at 100 mA. Stop immediately for unexpected voltage on a disconnected USB connector, current limiting during idle, a second power path, VSYS above 5.5 V, or any GPIO above the local 0–3.3 V boundary.

## Recommended build

Use one Raspberry Pi Pico 2 **SC1631** (SC1632 is the factory-header substitution) on one BusBoard **BB830**. The Pico datasheet says SC1631 is the unheadered board and SC1632 is the headered board, exposes 26 3.3 V GPIO, accepts 1.8–5.5 V on VSYS, and has a VBUS-to-VSYS diode. Raspberry Pi also recommends keeping external 3V3 load below 300 mA. The planned 250 mA supply ceiling is therefore a conservative bench rule, not a production electrical limit.

The base parts are two Omron **B3F-1000** through-hole momentary switches, one Adafruit **938** SSD1306 I²C display, one Kingbright **WP59EGW/CA** common-anode red/green LED, four each of YAGEO **CFR-25JB-52-1K** and **CFR-25JB-52-10K**, two YAGEO **CFR-25JB-52-100K**, one KEMET **C315C104K5R5TA** 100 nF capacitor, one FTDI **TTL-232R-3V3**, and one Adafruit **1957** jumper-wire pack. The optional Nexperia **PESD3V3U1UL,315** is a reviewed-later SMD candidate for a future exposed remote lead and was out of stock in the snapshot. The base bench has no remote cable.

## What is likely already owned

Check before buying: a solderless breadboard, 28 AWG jumpers, two dry-contact momentary switches, resistor/capacitor assortments, a 3.3 V UART adapter, a current-limited bench supply, DMM and (optionally) oscilloscope or logic analyzer. These are planning assumptions, not evidence of possession. The checklist deliberately asks the owner to confirm each one.

## Wiring allocation

GPIO numbers below are bench assignments, not a production pinout.

| Node | Connection and limit |
| --- | --- |
| GP2 local button | GP2 → 1 kΩ series → B3F-1000 → local GND; enable the Pico pull-up. Dry contact only. |
| GP3 second request input | For the base bench, place the second B3F-1000 beside the Pico: GP3 → 1 kΩ series → switch → local GND. This exercises the remote-request logic without creating an exposed cable. Do not attach a remote lead until its exact entry protection has been selected and independently reviewed. |
| GP4/GP5 display | SDA/SCL to Adafruit 938, plus Pico 3V3/GND. It is a 3.3 V interface; typical display current is about 40 mA. Inspect built-in pull-ups before adding any. |
| GP6/GP7 LED | Pico 3V3 to common anode; each cathode through its own 1 kΩ to GP6/GP7. Firmware sinks about 1 mA. Labels are diagnostic only: `REQUEST`, `FAULT`, `BOOT`. |
| GP0/GP1 UART | Pico TX→FTDI RXD, Pico RX→FTDI TXD, GND→GND. Leave FTDI VCC disconnected. Log 115200 8N1. Remove the logger USB before VSYS evidence. |
| GP26 ADC | VSYS → 100 kΩ → GP26 → 100 kΩ → GND, with 100 nF GP26-to-GND. This maps 0–5.5 V VSYS to at most 2.89 V using worst-case 5% parts; calibrate against the DMM. |
| GP8 marker | Probe only with a scope/logic analyzer. No actuator or external rail. |

## Safe build sequence

1. Mark the breadboard `LOW-SPEED BENCH — NO USB-C/PD/VBUS/TB` and keep all excluded equipment away.
2. Verify the received board marking is SC1631 (or intentionally selected SC1632); inspect for damage and install it across the breadboard gap.
3. Program and inspect firmware through the Pico micro-USB. Prove boot/reset cause and inactive outputs.
4. Disconnect USB at both ends. With the Pico unpowered, measure the disconnected USB VBUS to local GND and record 0 V.
5. Set a regulated supply to 3.3 V, output off, 100 mA limit. Verify the setting with the DMM; connect only VSYS and GND. Raise the limit only if needed, never above 250 mA.
6. Add GP2 and test one press/release. Add the UART logger with VCC omitted and confirm raw edges plus accepted events are logged.
7. Add the display and LED through the specified resistors. Keep diagnostic text honest; do not label anything `READY`, `PD`, `USB4` or a link speed.
8. Add the divider/capacitor and calibrate ADC samples against the DMM across 0–5.5 V only.
9. Add the second request button locally on the breadboard. Test open, clean press, synthetic bounce and short-to-ground at the current limit. A cabled remote is a later, independently reviewed protected-interface test.
10. Capture raw serial logs, supply voltage/current notes, reset cause, wiring revision/photo and the exact firmware commit. For B9/B10, use two explicitly labelled sequential captures: serial/reset-cause logs in the USB-powered setup with FTDI VCC floating, then repeat the scripted brownout/power-loss waveform with Pico USB and FTDI USB physically unplugged while recording DMM/scope/supply evidence. Never claim a USB-powered log is direct-VSYS evidence, and do not reconnect USB during the direct-VSYS run.

## Measurement limits

- VSYS: 0–5.5 V DC; use the DMM 6 V range when available.
- GPIO and ADC: 0–3.3 V DC relative to local GND; never drive GP26 above ADC_VREF.
- Divider: 100 kΩ / 100 kΩ, 1:1 nominal; worst-case 5% mapping at 5.5 V is 2.89 V. Use the measured 2.78 V figure only with the 1% pair specified in the existing bench design; with these 5% acquisition resistors, treat 2.89 V as the safe planning ceiling and record actual values. **The validator intentionally does not claim resistor tolerance accuracy.**
- Supply: 3.3 V set point; 100 mA start and 250 mA hard maximum.
- UART: 3.3 V, 115200 baud, 8N1.
- Scope/logic analyzer: local 0–5.5 V DC only, with probe ground on local GND; no mains, product rails or high-speed claim.
- Resistance/continuity: de-energized and USB-disconnected circuit only, 0–200 kΩ planned check range.

## Cost and availability snapshot

If nothing is on hand, the captured required-electronics roll-up is **$63.54–63.94 USD before tax/freight**. The validator recomputes that total from each included item, its quantity and its dated USD price range. The likely owner purchase is **$0–63.94** because this is a lab-bench consumables pack. A KA3005P supply is an optional planning range of **$100–180 USD** from a localized snapshot; an existing equivalent is preferred. A scope is optional; do not buy one for this issue alone.

The exact snapshot details, distributor part numbers and unresolved availability are in the inventory. Notable caveats: the optional ESD part was out of stock; SC1632 has manufacturer identity but no separate current distributor price captured; the supply snapshot is in PLN; display substitutions change connector/pull-up details. Re-open every URL and verify exact variant, authorized channel, price, shipping, tax and stock before requesting approval.

## Evidence boundary

This pack does not prove a production controller, state machine, brownout threshold, VBUS isolation, USB-C/PD behavior, Thunderbolt behavior, signal integrity, EMI, compliance, host compatibility or physical product safety. It is complete only as a `PROPOSED` acquisition/build preparation pack. No item has been purchased and no vendor has been contacted.
