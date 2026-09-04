# Golden floor-plan tests

Each folder is one approved ("canonical") property: a floor plan whose
normalized model and render have been signed off. Once a plan is here, future
pipeline changes must not silently break it.

```
golden-tests/
  property-001/
    expected-property.json   # normalized PropertyModel (metres) — the truth
    reference-render.png     # approved dollhouse render for visual diffing
    README.md                # provenance + which source plan this represents
```

Source floor-plan images are **deliberately not committed** — customer plans
are personal data and this is a public repository. Keep them locally and note
their identity in each property's README.

Run the checks:

```bash
npm run golden        # validates every expected-property.json
```

Adding a new canonical property: model the plan as `expected-property.json`
(or approve a pipeline extraction), run the validator, screenshot the render
with the property loaded (`/smart-energy-home/?demoProperty=<id>`), and save
it as `reference-render.png`.
