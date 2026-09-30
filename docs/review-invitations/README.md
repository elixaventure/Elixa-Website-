# Getting sign-off reviews onto Google and Trustpilot

The reviews customers leave in TaskFlow cannot be copied onto Google or
Trustpilot. Both require the review to come from the customer's own account,
and Trustpilot's guidelines state plainly that a business must not influence
what a reviewer says. The customer's permission does not fix this — the
problem is not consent, it is authorship.

What can be done is invite them, and TaskFlow already holds everything
needed to do it well: it knows the job finished, and it has the customer.

## Three rules that shape the design

**No asking on site, and no business device.** Google's 2026 update bans
requesting a review while the customer is still on the premises, and bans
collecting reviews on a shared business device or kiosk. The installer
handing over a tablet at sign-off — the obvious idea, and the highest
converting moment — is not allowed. It has to reach the customer's own
phone, later.

**No cherry-picking.** The invitation must go to every customer, not only
the ones who left five stars in the app. Google requires requests to be sent
evenly; Trustpilot calls selective inviting illegal. So the send must not be
conditional on the TaskFlow rating, and there must be no "was it good?" gate
in front of it.

**No incentives.** Nothing offered in return, not a discount, not entry into
a draw, not a free service. This is an instant ban from both.

## What to build

A scheduled send, a few days after sign-off. Trustpilot suggests 7–14 days;
for an installation, 3–7 works, while the job is fresh and any teething
issues have surfaced.

```
on job signed off:
  schedule invitation for signoff_date + 5 days

on invitation due:
  if customer opted out of marketing        -> skip, log why
  if an invitation was already sent for this job -> skip
  send SMS or email with the review link
  record sent_at against the job
```

Send it regardless of the rating the customer left in the app.

### The message

Short, no pressure, no steer on what to say:

> Hi {firstName}, thanks again for having Elixa Renewables in. If you have a
> minute, a review helps other people find us: {link}
> No obligation at all — and if anything is not right, reply here instead and
> we will sort it.
>
> Elixa Renewables Group. Reply STOP to opt out.

That last line is not optional for SMS in the UK — PECR requires a working
opt-out on marketing messages.

Do not write "leave us a 5 star review", do not name the installer and ask
for them to be mentioned (Google's 2026 update bans asking for staff names),
and do not chase more than once.

### The links

**Google.** Google Business Profile generates a review link and QR code for
you — it was formalised in December 2025. Or build it by hand:

```
https://search.google.com/local/writereview?placeid=<PLACE_ID>
```

Once you have it, paste it into `content/site.ts` as `googleReviewUrl` on
the website too. A quiet footer link appears automatically; it renders
nothing while that value is empty.

**Trustpilot.** The free plan includes 50 invitations a month through their
Automatic Feedback Service, which is well clear of five jobs a month. It can
send on its own from a purchase or job feed, so it may be less work than
building the send yourself.

### Which one first

Google. Google stopped showing stars in search results for reviews hosted on
a company's own website years ago — it treats them as self-serving. The star
ratings next to competitors in search come from Google reviews. The review
markup on this site is real and useful, particularly to AI assistants reading
the page, but it will never put stars beside us in a search result. Google
reviews will.

## What stays on the website

Nothing changes about the sign-off feed. It keeps showing what the customer
wrote in the app, with their permission, as it does now. The Google review is
a separate thing the same customer may also choose to leave, and the two do
not need to match.
