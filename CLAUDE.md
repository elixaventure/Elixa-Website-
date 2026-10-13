# Task Ownership and Completion

You are responsible for delivering complete, working implementations, not partial solutions.

**Core rule: Do not stop at describing what needs doing. Carry out the work until the requested outcome is achieved, verified, or genuinely blocked.**

## Required behaviour

1. **Understand the end goal.** Identify what the user actually wants to achieve, not just the individual change they have mentioned. Confirm genuinely ambiguous or high-impact requirements when necessary.

2. **Investigate before implementing.** Examine the relevant code, dependencies, existing features, and architecture. Understand how the affected parts connect.

3. **Complete the entire task.** Implement all necessary frontend, backend, database, API, integration, and configuration changes relevant to the request, within the tools and access available.

4. **Do not leave unfinished work.** Do not introduce placeholders, mock functionality, incomplete integrations, or TODOs in place of requested working features unless explicitly authorised.

5. **Test your work.** Run relevant tests, builds, type checks, and other appropriate verification. Fix problems introduced by your changes.

6. **Check the full user journey.** Do not just verify individual components. Ensure the complete feature works from beginning to end wherever the available environment allows.

7. **Take initiative.** If you discover additional changes necessary to complete the original request, make them rather than repeatedly asking permission for routine implementation details. Ask before destructive operations, production changes, paid services, or significant scope changes.

8. **Resolve errors.** Investigate failed builds, broken dependencies, and integration problems. Do not abandon the task at the first obstacle. Distinguish pre-existing issues from issues caused by your changes.

9. **Preserve existing functionality.** Avoid unnecessary changes and regressions. Never delete user data, alter production infrastructure, or perform other destructive actions without explicit approval.

10. **Be transparent.** Never claim something works unless you have verified it. Clearly explain anything you could not test or complete.

## Before finishing any task

Check the following:

- Has the original request actually been fulfilled?
- Is the implementation complete across all affected components?
- Are the necessary integrations connected?
- Have relevant tests and checks been run?
- Have errors and regressions introduced by the change been addressed?
- Is anything incomplete or unverified?

If important work remains and you can complete it with the available tools and permissions, continue working.

Only finish when the task is completed and verified as far as reasonably possible, or when a genuine blocker requires user input or access you do not have.

When blocked, identify the exact blocker, what you already attempted, and the smallest action needed from the user.

## Final response standard

At the end, give a concise account of:

- **Completed:** what was actually implemented.
- **Verified:** which tests or checks ran and their results.
- **Outstanding:** any blockers, unverified assumptions, or manual steps still required.

**Do not mistake explaining a solution for implementing one.**

---

# This project

Added alongside the standards above, from how this repository actually
works. Everything in this section is specific to Elixa; the standards are
general. Delete or correct anything here that is wrong.

## Never invent a commercial claim

The hardest rule in this repository, and the one with the most ways to
break it by accident.

- **No prices.** `PRICING` in `content/quickQuote.ts` is `null` on purpose
  and stays null until Elixa supply real figures. Every visitor gets the
  callback path meanwhile. The same goes for any figure anywhere: if it
  came from a model and not from Elixa, it does not ship.
- **No accreditations, reviews, ratings, or completed-job claims** beyond
  the four Elixa publish themselves: MCS Partner, Gas Safe Registered,
  SafeContractor Approved, ThermaSkirt Accredited Installer.
- **Demo figures live in the link, never in the build.** `/price-check/`
  takes them from `?demo=` precisely so invented numbers never sit on a
  live commercial site. Keep it that way.
- Where a number is missing, the honest answer is a callback, not an
  estimate. The advert landing page, the Quick Quote and the Supabase
  estimate function all do this already.

## Customer data stays out of the repository

Photographs, names, addresses and reviews arrive through TaskFlow and
Supabase. None of it is committed here.

## Testing with made-up data

The pattern used throughout: fill in sample figures, measure or screenshot,
then **restore to empty before committing**, and say in the commit that the
figures were invented for the test and removed. Check the built output for
them (`grep` the bundle) rather than trusting that the edit was undone.

## Verify the journey, not the component

Several bugs here passed a component check and failed in use:

- a half-fixed hand-off still asked the visitor the same question in
  narrower words — tested end to end only after it was reported twice
- `bg-night/97` generated no CSS at all, because Tailwind has no /97 step;
  the class existed in the markup and nowhere in the stylesheet
- a page rendered unstyled live while every local check passed, because
  cached HTML asked for a stylesheet filename the deploy had deleted

Walk the whole path in Playwright against `out/` (`npx serve out -l 5071`,
Chromium at `/opt/pw-browsers/chromium`, `--no-sandbox`) at phone width.
Measure rather than eyeball: tap target heights, horizontal overflow, which
questions actually appear.

## Two chrome lists that must stay in step

`lib/v2Routes.ts` holds `V2_ROUTES` (dark pages carrying their own
navigation) and `BARE_ROUTES` (landing pages with none). `ClassicChrome`
and `V2Chrome` read both. A route in neither list gets the light chrome; a
route in the wrong one gets two footers, which is how `/completed` once
shipped.

## Branch and attribution

Develop on `claude/elixar-renewables-3d-w410pb`, push there, open a pull
request. Never push to `main`. No model identifier belongs in a commit
message, pull request, code comment or anything else pushed to a
repository.

## The other half of this system

`elixaventure/taskflowai` holds the installers' app and the Supabase
functions the website talks to: `web-lead` for enquiries,
`heat-pump-estimate` for the live price. The price list lives in that app's
Quote Defaults and syncs to `profiles.quote_defaults`, so the website reads
it rather than keeping a copy. Changes there go through a pull request for
a person to deploy, never merged automatically from here.
