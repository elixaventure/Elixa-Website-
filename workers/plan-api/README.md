# Plan recognition relay (RasterScan)

Turns a customer's uploaded floor plan into structured walls/doors/windows via
the RasterScan "Floor Plan Digitalization" API. The website is static, so this
tiny Cloudflare Worker holds the API key and relays the image.

The site works fine **without** this — the in-browser extractor is the default
and remains the fallback. Deploying the Worker and setting one repository
variable switches the API on.

## One-time setup (~15 minutes)

1. **RapidAPI key**
   - Create an account at rapidapi.com and open the *Floor Plan Digitalization*
     API (by akashdev2016): https://rapidapi.com/akashdev2016/api/floor-plan-digitalization
   - Subscribe (there is a free/basic tier to start) and copy your
     `X-RapidAPI-Key` from the endpoints page.
   - While there, check the endpoint path shown in the playground. If it is not
     `/plan_recognition`, put the real path in `PLAN_PATH` in `wrangler.toml`.

2. **Deploy the Worker** (free Cloudflare account)
   ```bash
   cd workers/plan-api
   npm i -g wrangler
   wrangler login
   wrangler deploy
   wrangler secret put RAPIDAPI_KEY   # paste the key when prompted
   ```
   Note the printed URL, e.g. `https://elixa-plan-api.<your-subdomain>.workers.dev`.

3. **Point the site at it**
   - GitHub repo → Settings → Secrets and variables → Actions → **Variables** →
     new repository variable `NEXT_PUBLIC_PLAN_API_URL` = the Worker URL.
   - The deploy workflow passes it into the build automatically; re-run the
     deploy (or push any commit).

4. **Test** — upload a plan on /smart-energy-home/ with the browser console
   open. You should see `[elixa] plan api response: …` followed by
   `[elixa] plan adapter: N wall boxes …`. If the adapter logs
   "no usable walls", send that response line to Claude — the adapter is
   schema-tolerant but may need one small mapping added for the provider's
   exact field names.

## Privacy note

Customer floor plans are personal data. With the relay enabled they are sent
to RasterScan for processing — reflect that in the privacy policy. RasterScan
also sells an on-premise Docker licence (contact@rasterscan.com) if plans must
never leave your infrastructure; the Worker then points at that host instead.
