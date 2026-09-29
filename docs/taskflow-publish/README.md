# Publishing sign-offs from TaskFlow AI to this website

The website end is finished and live. `content/signoffs.json` holds the
published jobs, the site reads it at build time, and the "Recently completed"
section appears on the homepage and on `/projects` the moment that file has
something in it. While it is `[]`, the section renders nothing at all — no
heading, no placeholder — which is why there is no visible spot on the site
today.

Nothing has ever written to that file. This folder is the missing piece.

## What has to exist on the TaskFlow side

1. **A GitHub token**, stored as the Supabase secret `GITHUB_TOKEN`.
   A fine-grained personal access token, scoped to `elixaventure/Elixa-Website-`,
   with **Contents: Read and write**. The repository is public, so the
   "Public repositories" option is enough — but *Contents: write* is not
   optional, and a token with only read access fails with a 403 that looks
   like a login problem.

   Tokens expire. A 30-day token means the button stops working in 30 days
   with no warning. Set a reminder, or use a longer expiry.

2. **The Edge Function** in `publish-signoff.ts`, deployed on the TaskFlow
   Supabase project:

   ```
   supabase functions deploy publish-signoff
   ```

3. **The button** on the admin screen calling it with the payload below.

## What the button sends

```jsonc
{
  "jobId": "job_1234",              // stable id — also the photo folder name
  "date": "2026-09-22",             // ISO, the sign-off date
  "firstName": "Sarah",             // first name only, or "" for anonymous
  "area": "Manchester",             // town only
  "summary": "ThermaSkirt fitted throughout the ground floor...",
  "system": "ThermaSkirt",
  "comment": "the customer's own words, unedited",
  "rating": 5,
  "photos": [
    { "bucket": "job-photos", "path": "job_1234/after-1.jpg", "alt": "ThermaSkirt along a hallway" }
  ],
  "consent": true,                  // the customer ticked the box at sign-off
  "consentRecordedBy": "installer name or id",
  "branch": "signoff-test"          // optional — see "Testing" below
}
```

The `Authorization: Bearer <jwt>` header of the signed-in admin is required.
The function checks the caller is an admin before it writes anything.

## What it does

Downloads the photographs from Supabase Storage, commits them under
`public/media/signoffs/<jobId>/` **and** the new entry in
`content/signoffs.json` as a **single commit**, so the site rebuilds once and
is never left showing a card whose photographs have not landed yet.

Publishing the same job twice replaces the entry rather than duplicating it.

## What it refuses

- **No consent, no publish.** The function returns 403 and writes nothing.
  Consent cannot be added retrospectively on the customer's behalf — the
  jobs signed off before the tick box existed cannot be published unless you
  go back and ask those customers.
- A surname in `firstName`, a house number at the start of `area`, or a
  postcode, price, email address or phone number anywhere in the text.
- More than six photographs, or any single photograph over 8MB.
- A photograph with no description — screen readers and search engines both
  read it.

These checks live in the function rather than only in the admin screen
because this is the last point before the data is public, and a mistake here
cannot be pulled back out of search engines.

## Testing without putting anything on the live site

Pass `"branch": "signoff-test"` in the payload. The site only builds from
`claude/elixar-renewables-3d-w410pb`, so a commit on any other branch proves
the whole path works — token, permissions, photo download, commit — while the
public site stays untouched.

Create the branch first (once):

```
git push origin claude/elixar-renewables-3d-w410pb:refs/heads/signoff-test
```

Then publish one job to it and check
`https://github.com/elixaventure/Elixa-Website-/blob/signoff-test/content/signoffs.json`.

## Telling whether it worked

The honest test is the file, not the website:

**https://github.com/elixaventure/Elixa-Website-/blob/claude/elixar-renewables-3d-w410pb/content/signoffs.json**

- Still `[]` → the button never reached GitHub. The function's response body
  says why; the Supabase function logs have the detail.
- Has an entry → it worked. The site rebuilds in about two minutes, and the
  section appears on its own.

## One thing to watch

The photographs are **copied into the repository**, not linked to Supabase.
That is deliberate: a Supabase signed URL expires, and a linked photo would
show today and break next week. Copying them costs repository space and means
a withdrawn permission needs the files removing from the repo as well as the
entry — which is the right trade for photographs that are meant to stay up.
