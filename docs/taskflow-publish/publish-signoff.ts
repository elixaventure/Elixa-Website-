/**
 * publish-signoff — the bridge between TaskFlow AI and this website.
 *
 * Deploy this as a Supabase Edge Function on the TaskFlow project. The
 * "Publish to website feed" button on the admin screen calls it. It commits
 * the photographs and one entry in content/signoffs.json straight to the
 * repository, the deploy workflow picks the commit up, and the job appears on
 * the site a minute or two later.
 *
 * ── Why the Git Data API rather than the simple one ────────────────────
 * The Contents API writes one file per request, so three photos plus the JSON
 * would be four commits and four site rebuilds, with the feed briefly
 * pointing at photographs that have not landed yet. This builds one tree and
 * pushes one commit, so the site rebuilds once and is never half-published.
 *
 * ── What it refuses to do ──────────────────────────────────────────────
 * Publish without recorded consent, publish a surname, a house number, a
 * postcode or a price. Those checks are here rather than only in the admin
 * screen because this is the last point before the data becomes public and
 * a mistake here cannot be taken back from search engines.
 *
 *   supabase functions deploy publish-signoff
 *   supabase secrets set GITHUB_TOKEN=... --project-ref <your ref>
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const OWNER = "elixaventure";
const REPO = "Elixa-Website-";
/** The branch GitHub Pages builds from. Also this repo's default branch. */
const LIVE_BRANCH = "claude/elixar-renewables-3d-w410pb";

const MAX_PHOTOS = 6;
/** A phone photo over this is a mistake, not a choice. */
const MAX_BYTES = 8 * 1024 * 1024;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PhotoIn {
  bucket: string;
  path: string;
  alt: string;
}

interface Body {
  /** stable job id from TaskFlow — also the anchor and the folder name */
  jobId: string;
  /** ISO date the job was signed off */
  date: string;
  /** first name only, or "" where the customer chose to stay anonymous */
  firstName: string;
  /** town only */
  area: string;
  /** Elixa's own summary of the work */
  summary: string;
  /** e.g. "Air source heat pump" */
  system: string;
  comment?: string;
  rating?: number;
  photos?: PhotoIn[];
  /** must be true — the customer ticked the box at sign-off */
  consent: boolean;
  /** who recorded the consent, kept in the commit message as the audit trail */
  consentRecordedBy?: string;
  /**
   * Push somewhere other than the live branch. Use this to prove the
   * plumbing works without putting anything on the public site.
   */
  branch?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const token = Deno.env.get("GITHUB_TOKEN");
    if (!token) throw new HttpError(500, "GITHUB_TOKEN is not set on this project");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Service role bypasses RLS, so the caller has to be checked by hand.
    // Anyone who can reach this function can otherwise publish to the site.
    const jwt = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!jwt) throw new HttpError(401, "not signed in");
    const { data: auth } = await supabase.auth.getUser(jwt);
    if (!auth?.user) throw new HttpError(401, "not signed in");
    if (!(await isAdmin(supabase, auth.user.id))) {
      throw new HttpError(403, "only an admin can publish to the website");
    }

    const body = (await req.json()) as Body;
    check(body);

    const branch = body.branch?.trim() || LIVE_BRANCH;
    const gh = github(token);

    // ── where the branch is now ────────────────────────────────────────
    const ref = await gh(`/git/ref/heads/${encodeURIComponent(branch)}`);
    const headSha: string = ref.object.sha;
    const headCommit = await gh(`/git/commits/${headSha}`);
    const baseTree: string = headCommit.tree.sha;

    // ── photographs into blobs ─────────────────────────────────────────
    const id = slug(body.jobId);
    const tree: Array<Record<string, string>> = [];
    const photosOut: Array<{ src: string; alt: string }> = [];

    for (const [i, p] of (body.photos ?? []).entries()) {
      const { bytes, ext } = await pullPhoto(supabase, p);
      if (bytes.length > MAX_BYTES) {
        throw new HttpError(413, `photo ${i + 1} is ${mb(bytes.length)}MB — resize it first`);
      }
      const blob = await gh("/git/blobs", {
        method: "POST",
        body: JSON.stringify({ content: base64(bytes), encoding: "base64" }),
      });
      const file = `public/media/signoffs/${id}/${i + 1}.${ext}`;
      tree.push({ path: file, mode: "100644", type: "blob", sha: blob.sha });
      photosOut.push({ src: `/media/signoffs/${id}/${i + 1}.${ext}`, alt: p.alt });
    }

    // ── the entry itself ───────────────────────────────────────────────
    const entry = {
      id,
      date: body.date,
      firstName: body.firstName ?? "",
      area: body.area.trim(),
      summary: body.summary.trim(),
      system: body.system.trim(),
      ...(body.comment?.trim() ? { comment: body.comment.trim() } : {}),
      ...(typeof body.rating === "number" ? { rating: Math.round(body.rating) } : {}),
      ...(photosOut.length ? { photos: photosOut } : {}),
    };

    const current = await readSignOffs(gh, branch);
    // Re-publishing the same job replaces it rather than doubling it up.
    const next = [entry, ...current.filter((s) => s.id !== id)];
    next.sort((a, b) => String(b.date).localeCompare(String(a.date)));

    tree.push({
      path: "content/signoffs.json",
      mode: "100644",
      type: "blob",
      content: `${JSON.stringify(next, null, 2)}\n`,
    });

    // ── one tree, one commit, one rebuild ──────────────────────────────
    const newTree = await gh("/git/trees", {
      method: "POST",
      body: JSON.stringify({ base_tree: baseTree, tree }),
    });

    const who = body.consentRecordedBy ? ` Consent recorded by ${body.consentRecordedBy}.` : "";
    const commit = await gh("/git/commits", {
      method: "POST",
      body: JSON.stringify({
        message:
          `Publish sign-off ${id} — ${entry.system}, ${entry.area}\n\n` +
          `Published from TaskFlow AI by ${auth.user.email ?? auth.user.id}.` +
          `${who}\n${photosOut.length} photograph(s).\n`,
        tree: newTree.sha,
        parents: [headSha],
      }),
    });

    await gh(`/git/refs/heads/${encodeURIComponent(branch)}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha }),
    });

    return json(200, {
      ok: true,
      commit: commit.sha,
      branch,
      live: branch === LIVE_BRANCH,
      entries: next.length,
      url: `https://github.com/${OWNER}/${REPO}/commit/${commit.sha}`,
    });
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    console.error("[publish-signoff]", e);
    return json(status, { ok: false, error: (e as Error).message });
  }
});

/* ───────────────────────────── helpers ──────────────────────────────── */

class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

/**
 * Everything that must never reach the public site.
 *
 * Deliberately blunt. A false positive costs somebody thirty seconds of
 * rewording; a false negative puts a customer's address on the internet.
 */
function check(b: Body) {
  if (b.consent !== true) {
    throw new HttpError(
      403,
      "no photo permission on file for this job — it cannot be published. " +
        "Consent has to be given by the customer, and cannot be added afterwards on their behalf.",
    );
  }
  for (const k of ["jobId", "date", "area", "summary", "system"] as const) {
    if (typeof b[k] !== "string" || !b[k].trim()) throw new HttpError(400, `${k} is required`);
  }
  if (typeof b.firstName !== "string") {
    throw new HttpError(400, 'firstName is required — use "" for anonymous');
  }
  if (Number.isNaN(Date.parse(b.date))) throw new HttpError(400, `unparseable date "${b.date}"`);
  if (b.rating !== undefined && (typeof b.rating !== "number" || b.rating < 1 || b.rating > 5)) {
    throw new HttpError(400, "rating must be a number from 1 to 5");
  }
  if (b.firstName.trim().includes(" ")) {
    throw new HttpError(400, "firstName must be a first name only — no surname");
  }
  if (/^\s*\d/.test(b.area)) {
    throw new HttpError(400, "area looks like it starts with a house number — town only");
  }

  const POSTCODE = /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i;
  const PRICE = /£\s*\d|\b\d[\d,]*\s*(?:pounds|gbp)\b/i;
  const EMAIL = /\S+@\S+\.\S+/;
  const PHONE = /\b(?:0\d[\d\s-]{8,}|\+44[\d\s-]{9,})\b/;

  for (const [label, text] of [
    ["area", b.area],
    ["summary", b.summary],
    ["comment", b.comment ?? ""],
    ...(b.photos ?? []).map((p, i) => [`photo ${i + 1} description`, p.alt] as const),
  ] as Array<readonly [string, string]>) {
    if (POSTCODE.test(text)) throw new HttpError(400, `${label} contains a postcode`);
    if (PRICE.test(text)) throw new HttpError(400, `${label} contains a price`);
    if (EMAIL.test(text)) throw new HttpError(400, `${label} contains an email address`);
    if (PHONE.test(text)) throw new HttpError(400, `${label} contains a phone number`);
  }

  if ((b.photos?.length ?? 0) > MAX_PHOTOS) {
    throw new HttpError(400, `${MAX_PHOTOS} photographs maximum`);
  }
  for (const [i, p] of (b.photos ?? []).entries()) {
    if (!p.bucket || !p.path) throw new HttpError(400, `photo ${i + 1} is missing its storage path`);
    if (!p.alt?.trim()) {
      throw new HttpError(400, `photo ${i + 1} needs a description — screen readers and search engines both read it`);
    }
  }
}

/** Adjust to however TaskFlow stores roles. */
async function isAdmin(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).single();
  return data?.role === "admin" || data?.role === "owner";
}

function github(token: string) {
  return async (path: string, init: RequestInit = {}) => {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "taskflow-publish-signoff",
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) {
      const detail = await res.text();
      // 401/403 here is almost always the token: expired, or without
      // Contents: write on this repository.
      throw new HttpError(
        res.status === 401 || res.status === 403 ? 502 : 502,
        `GitHub said ${res.status} on ${path} — ${detail.slice(0, 400)}`,
      );
    }
    return res.json();
  };
}

async function readSignOffs(gh: ReturnType<typeof github>, branch: string) {
  try {
    const file = await gh(`/contents/content/signoffs.json?ref=${encodeURIComponent(branch)}`);
    const text = new TextDecoder().decode(
      Uint8Array.from(atob(String(file.content).replace(/\n/g, "")), (c) => c.charCodeAt(0)),
    );
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? (parsed as Array<{ id: string; date: string }>) : [];
  } catch {
    // A missing or unreadable file starts a fresh list rather than failing
    // the publish — the website loader tolerates the same thing.
    return [];
  }
}

async function pullPhoto(supabase: ReturnType<typeof createClient>, p: PhotoIn) {
  // Ask for a web-sized copy. Image transformation is a paid feature, so
  // fall back to the original rather than failing the publish.
  let blob: Blob | null = null;
  const sized = await supabase.storage
    .from(p.bucket)
    .download(p.path, { transform: { width: 1600, quality: 78 } });
  if (sized.data) blob = sized.data;

  if (!blob) {
    const raw = await supabase.storage.from(p.bucket).download(p.path);
    if (raw.error || !raw.data) {
      throw new HttpError(404, `could not read ${p.bucket}/${p.path} — ${raw.error?.message ?? "missing"}`);
    }
    blob = raw.data;
  }

  const bytes = new Uint8Array(await blob.arrayBuffer());
  const type = blob.type || "image/jpeg";
  const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
  return { bytes, ext };
}

/** Chunked — spreading a few megabytes into fromCharCode blows the stack. */
function base64(bytes: Uint8Array): string {
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "signoff";

const mb = (n: number) => (n / 1024 / 1024).toFixed(1);

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
