# Controller-bench owner approval packet

Status: **prepared, not approved and not ordered**. Prices and shown stock were
captured on 2026-09-01. No cart was created and no vendor was contacted.

## Preferred single-storefront route

Buy the existing exact base-electronics list from DigiKey, plus:

- SRA `KD3005D` current-limited supply — `$94.38`;
- Klein `MM325` CAT III multimeter — `$39.74`;
- Pomona `3782-24-0` black and `3782-24-2` red banana-to-minigrabber leads —
  `$12.14` each.

The 16 exact lines total **$221.96 merchandise**. DigiKey currently publishes a
sitewide USPS Ground Advantage starting rate of **$4.99**, making **$226.95** an
arithmetic starting total—not a route quote. The supply and meter are marked as
marketplace products and may add shipping. Tax, tariff and final shipping remain
unknown until destination and cart calculation, so there is no honest landed
upper bound yet.

The exact URLs, quantities, prices, shown stock and computed totals are in
[`acquisition.approval.json`](../../../../design/controller-bench/acquisition.approval.json).

## Why these instruments

The `KD3005D` manual documents a US-compatible input selection and included
power cord. Separate known Pomona output leads remove ambiguity about whether
bench leads ship in the supply box. The `MM325` has enough resolution for the
documented 3.3 V / 5.5 V coarse checks and gives a beginner-owned kit a stated
CAT III rating; the cheaper no-CAT meter was rejected.

## Mandatory first-use checks

Before mains power, inspect the received supply and verify its selector reads
110/120 V and its fuse marking is `T5A/250V`. Do not assume the supply provides a
hard 250 mA interlock. With a known load, set and verify 3.3 V and the initial
100 mA current limit; never raise the procedural ceiling above 250 mA. Check the
meter against a known voltage before recording evidence.

No remote cable, USB-C/PD/TB hardware, dock, MacBook or product-power connection
is part of this packet.

## Owner authority still required

Authority is deliberately split. First, the owner may separately authorize a
no-purchase cart/address calculation. Vendor contact remains separate. A later
purchase authorization must name the exact items and a maximum landed spend.
Until each permission is explicit: do not create a cart, contact a vendor or
place an order.
