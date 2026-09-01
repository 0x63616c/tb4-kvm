# Enclosure and mount interface guidance

The enclosure is deliberately an interface contract, not a finished shape. Locking dimensions before the controller, power topology and thermal measurements would convert electrical uncertainty into repeated mechanical rework.

## Mechanical architecture

Use three separable pieces:

1. **Core electronics tray** — carries the proven main PCB and its thermal interface.
2. **Replaceable connector faceplates** — capture the USB-C and power-input openings without forcing a complete reprint when connector footprints move.
3. **Low-speed control pod** — carries the button and optional display away from the high-speed routing area and can be desk-, monitor- or under-desk-mounted independently.

The mount should attach to the tray, not directly to the PCB or connector shells. Cables must not use USB-C solder joints as structural members.

## Datums to publish with the PCB

Once the measured Rev B board is stable, export a STEP model and a machine-readable drawing from the PCB tool using these datums:

- **Datum A:** PCB bottom plane.
- **Datum B:** external face of the downstream USB-C connector shell.
- **Datum C:** centerline of the downstream USB-C receptacle.
- **Origin:** intersection of Datum A projection, Datum B and Datum C.

Every connector center, mounting hole, tallest component, heat source and keepout should be dimensioned from those datums. Do not dimension enclosure features by chaining from one component to the next.

## Required PCB-to-enclosure interface table

The values remain `TBD — measure from released PCB` until layout and assembly are proven.

| Interface | Required released value | Why it matters |
|---|---|---|
| Board outline and corner radii | STEP plus 2D drawing | Defines tray and faceplate, not guessed CAD |
| Mounting-hole centers and finished diameter | X/Y from datums; plated/non-plated status | Prevents load through connectors or components |
| Component maximum heights, top and bottom | Zoned height map | Controls lid, standoff and insulation clearance |
| USB-C shell position and insertion axis | X/Y/Z plus angular tolerance | Prevents cable side-load and partial insertion |
| Connector keepout | Minimum free volume around each plug | Allows real TB4 cable overmolds and latch-free removal |
| External cable bend corridor | Verified with selected certified cables | Avoids tight bends that load the port or dominate desk depth |
| Thermal interface area | Location, flatness and allowed compression | Couples controller/power heat without board bending |
| Antenna/noisy switcher keepouts | If applicable | Prevents the enclosure or display cable from harming EMI behavior |
| Display/button cable exit | Low-speed connector and strain-relief geometry | Keeps UI wiring away from the TB4 channel |
| Label and serial area | Minimum flat area | Supports open-hardware revision and compliance labeling |

## Layout-to-mechanics rules

- Put upstream A and B on one accessible edge if the high-speed channel model permits; clearly label both from normal viewing position.
- Put the downstream dock port on a different face or separate it unmistakably so a host cannot be plugged into the wrong role.
- Place the power input where its cable cannot obstruct USB-C insertion or the physical switch.
- Reserve tool access for fasteners without removing USB-C cables.
- Keep metal fasteners and heat spreaders out of component and high-speed-via keepouts.
- Provide strain relief or a cable comb for three stiff cables; do not rely on friction-fit USB-C shells.
- Make the display optional and electrically detachable so a damaged UI does not disable switching.
- Keep ventilation paths useful in both desk-top and under-desk orientations.

## Thermal proof before enclosure release

Measure the integrated board at idle, full charging load and simultaneous display/storage/Ethernet load. Record controller, mux, PD/power FET, regulator, enclosure-surface and inlet-air temperatures. Repeat in the intended worst-case mount orientation.

The release enclosure requires:

- measured steady-state temperature margins to every component rating;
- no surface hot spot unsafe for normal handling;
- no thermal pad load that bows the PCB;
- no vent path blocked by the desk or mount;
- repeat testing at the expected maximum ambient temperature.

Until those results exist, heatsink area, vent count and enclosure volume are hypotheses.

## Printable prototype sequence

1. Print connector/faceplate gauges from the actual connector vendor STEP models.
2. Print a board-outline dummy with exact holes and height blocks.
3. Fit real certified TB4 cable overmolds and verify insertion/removal clearance.
4. Validate tray retention and cable strain relief with a non-powered board.
5. Print the thermal enclosure only after Rev B measurements locate the real heat paths.
6. Publish STL/3MF for convenience, but keep the parametric CAD and datum drawing as the source of truth.

## Mount interface recommendation

Use a replaceable mounting adapter on the electronics tray: four inserts in a rectangular pattern, with the exact spacing selected only after the board outline is stable. Separate adapters can then provide desk-top feet, under-desk screws, VHB tape, or a monitor/rail attachment without changing the electronics enclosure.

The production mechanical release must state print material, layer orientation, supports, fastener torque and expected cable-load direction. A render or a successful slicer import is not proof of fit.
