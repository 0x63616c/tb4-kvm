# Controller-bench approval-packet review

Date: 2026-09-01

Issue: [#18](https://github.com/0x63616c/tb4-kvm/issues/18)

Result: **ACCEPT**

## Scope

Independent safety and release review of the complete no-cart controller-bench
owner approval packet, including exact items, live source snapshots, arithmetic,
mains/current-limit guidance, owner-authority boundaries, schema, validator and
adversarial tests.

## Findings resolved before acceptance

1. `$8.49` was incorrectly described as DigiKey's shipping floor. The packet now
   uses the published `$4.99` sitewide USPS starting rate, labels `$226.95` only
   as arithmetic, and makes marketplace/split-shipping uncertainty explicit.
2. Generic route approval could be read as cart, contact and purchase authority.
   Those permissions are now separate; purchase authority must name the exact
   items and a maximum landed spend.
3. The first validator locked totals and five key MPNs but not the complete item
   set. It now locks the ordered 16-line snapshot by SHA-256, covering every
   identity, quantity, price, source, stock string and note.

## Independent acceptance evidence

The final reviewer accepted exact staged tree
`08e8ecbaf649353e0f2960e3786c484e03e44542` and independently confirmed:

- the complete ordered item snapshot hashes to
  `a54c1e123294855d096e4c9324dd22255b9536ac1c8d7e1f22ab11f9f7b86f36`;
- the baseline validator passes;
- all 12 checked-in adversarial mutants are rejected; and
- independently replayed fake identity/source/stock, quantity-price substitution
  and compensated USB-C scope-creep mutations all fail closed.

No remaining release blocker was found. This acceptance approves the packet as
an owner decision aid only. It does not authorize a cart, vendor contact,
purchase, substitution, mains energization or connection to valuable equipment.
