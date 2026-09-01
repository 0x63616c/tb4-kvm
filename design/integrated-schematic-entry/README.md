# Integrated schematic-entry contract

This machine-checked record describes the **proposed**, pre-capture boundary for
the later integrated TB4 KVM. It is not a schematic, netlist, BOM, footprint,
or a permission to create any of those artifacts.

`contract.json` remains deliberately fail-closed: all listed integrated gates
are `BLOCKED`; every controlled fact has null acceptance evidence; candidates
are not selections; and both schematic capture and ordering are unauthorized.
Its canonical mapping keeps router/recovery on issue #19, dual-host/downstream
power on issues #20/#21, and the channel route on issues #5/#6/#7/#8/#34.

Run `npm run verify:integrated-schematic-entry` to validate the contract and
its adversarial tests. The authoritative human-readable ownership and gate
records remain in the linked documents recorded by the contract.
