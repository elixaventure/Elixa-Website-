/**
 * Reads what it can from an uploaded floor plan so the 3D house configures
 * itself to match. Vector PDFs (most professionally drawn plans) carry their
 * room labels as real text — we extract it with pdf.js and derive:
 *   - bedroom count  ("BEDROOM 1..n")
 *   - storeys        (stairs present → two-storey; rooms all on one level → bungalow)
 *   - room names     (lounge, kitchen, dining, office… shown as the 3D labels)
 * Photos/scans have no text layer, so they return an empty analysis and the
 * customer confirms the shape by hand. All failures degrade silently.
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export interface PlanAnalysis {
  bedrooms?: 2 | 3 | 4 | 5;
  storeys?: 1 | 2;
  rooms: string[];
}

const ROOM_VOCAB: [RegExp, string][] = [
  [/LOUNGE|LIVING\s*ROOM|SITTING\s*ROOM/, "Lounge"],
  [/KITCHEN/, "Kitchen"],
  [/DINING/, "Dining room"],
  [/OFFICE|STUDY/, "Office"],
  [/UTILITY/, "Utility"],
  [/SHOWER\s*ROOM/, "Shower room"],
  [/BATH\s*ROOM/, "Bathroom"],
  [/EN[\s-]?SUITE/, "En-suite"],
  [/CONSERVATORY/, "Conservatory"],
  [/GARAGE/, "Garage"],
  [/HALL/, "Hall"],
];

export async function analysePlan(file: File): Promise<PlanAnalysis | null> {
  if (!(file.type === "application/pdf" || /\.pdf$/i.test(file.name))) return null;
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = `${BASE}/pdfjs/pdf.worker.min.mjs`;
    const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages = Math.min(doc.numPages, 8);
    let text = "";
    for (let i = 1; i <= pages; i++) {
      const page = await doc.getPage(i);
      const tc = await page.getTextContent();
      text += " " + tc.items.map((it) => ("str" in it ? it.str : "")).join(" ");
      page.cleanup();
    }
    const T = text.toUpperCase();

    // bedrooms: highest numbered "BEDROOM n", clamped to the configurator's range
    let bedrooms: PlanAnalysis["bedrooms"];
    const nums = Array.from(T.matchAll(/BED\s*ROOM\s*(\d)/g)).map((m) => parseInt(m[1], 10));
    if (nums.length) bedrooms = Math.max(2, Math.min(5, Math.max(...nums))) as 2 | 3 | 4 | 5;
    else if (/BED\s*ROOM/.test(T)) bedrooms = 2;

    // storeys: stairs mean two floors; bedrooms sharing a sheet with the
    // kitchen/lounge and no stairs reads as a bungalow
    let storeys: PlanAnalysis["storeys"];
    if (/STAIR|FIRST\s*FLOOR|LANDING/.test(T)) storeys = 2;
    else if (bedrooms && /KITCHEN|LOUNGE|LIVING/.test(T)) storeys = 1;

    const rooms: string[] = [];
    for (const [re, label] of ROOM_VOCAB) {
      if (re.test(T) && !rooms.includes(label)) rooms.push(label);
    }

    return { bedrooms, storeys, rooms };
  } catch (e) {
    console.warn("[elixa] plan analysis failed", e);
    return null;
  }
}
