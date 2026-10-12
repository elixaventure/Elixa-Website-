# Building the materials list from photographs

A brief for the TaskFlow project. Nothing here touches the website.

## The problem this replaces

The BOQ button searches the open web for prices. That returns confident
numbers for the wrong product, the wrong size or the wrong spec, with nothing
in the output to say so — and a bill of quantities built on them loses money
quietly. Public merchant prices are retail anyway; what Elixa pay is their
trade account price, which is behind a login and negotiated.

## What to build instead

Photograph a product and its price, or a merchant invoice. The app reads it,
shows what it read, and on confirmation saves it to a materials list that
grows out of real jobs.

Prices captured this way are the ones actually paid, and the list only ever
contains what Elixa actually fit.

## The flow

```
take or pick a photo
  -> read it (vision)
  -> show every field it extracted, editable
  -> installer confirms
  -> save, with the photo attached
```

**The confirmation step is not optional.** Vision models misread digits —
£41.50 and £4.50 differ by one dot. A wrong price saved silently is the same
failure as scraping, just slower to find. Show the numbers, let them be
corrected, require a tap.

## What to pull out of the image

| field | notes |
| --- | --- |
| supplier | the merchant. From the invoice header, or asked if unclear |
| product code | the SKU. This is the identity — match on it, not the name |
| description | as printed |
| unit price | the price paid, excluding VAT where the document separates it |
| unit | each, metre, box, length — quotes go wrong when this is guessed |
| pack size | where a price is per box of 10 rather than per item |
| date | the invoice date, or today for a shelf label |

Leave a field empty rather than invent one. An item with a price and no code
is still worth saving; an item with a guessed code corrupts future matching.

## Invoices are the fast path

One merchant invoice is twenty-odd lines, each with a code, a description and
the price actually charged. Building from single products is one item per
photograph; building from the invoices that already arrive every week fills
the list in a month.

So: handle a multi-line invoice as well as a single product. Extract every
line, show them as a list, let the installer untick anything irrelevant
(delivery charges, credits), and save the rest in one go.

## Storing it

- Match on `supplier + product_code`. The same item photographed again
  **updates** the current price and **keeps the old one as history**, so the
  app can show what has gone up and by how much.
- Keep the source image against every price. Six months on, when a number
  looks wrong, the answer is "here is the invoice it came from".
- Stamp every price with its date and supplier.
- Mark a price stale after a set age — three months is a reasonable start —
  and have the BOQ flag stale lines rather than quoting them silently.

## What the BOQ does with it

Only ever price from this list. Where an item is not in the list, say so and
leave it for a human — never fall back to searching the web for a number.
"I do not have a price for this" is a usable answer; a confident wrong price
is not.

## Worth asking Elixa

Which merchants they buy from most. Invoice layouts differ, and the reader
can be given examples of the two or three that matter rather than being
expected to handle everything.
