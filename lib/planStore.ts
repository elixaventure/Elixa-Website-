/**
 * Small IndexedDB store for the customer's uploaded floor plan, so a file
 * added in the Smart Energy Home carries through to the quote wizard (and is
 * submitted with the lead for the heat-loss calculation). Static-site safe;
 * all methods fail soft to null/no-op where storage is unavailable.
 */

const DB = "elixa";
const STORE = "floor-plan";
const KEY = "current";
const PREVIEW_KEY = "preview";

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function savePlan(file: File): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ name: file.name, type: file.type, blob: file }, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
  db.close();
}

export async function loadPlan(): Promise<File | null> {
  const db = await openDb();
  if (!db) return null;
  const rec = await new Promise<{ name: string; type: string; blob: Blob } | null>((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => resolve(null);
  });
  db.close();
  if (!rec?.blob) return null;
  try {
    return new File([rec.blob], rec.name || "floor-plan", { type: rec.type || rec.blob.type });
  } catch {
    return null;
  }
}

/** What we read from the plan (bedrooms/storeys/room names), as JSON. */
export async function savePlanAnalysis(analysis: unknown): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(JSON.stringify(analysis), "analysis");
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
  db.close();
}

export async function loadPlanAnalysis<T>(): Promise<T | null> {
  const db = await openDb();
  if (!db) return null;
  const raw = await new Promise<string | null>((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get("analysis");
    req.onsuccess = () => resolve(typeof req.result === "string" ? req.result : null);
    req.onerror = () => resolve(null);
  });
  db.close();
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Rendered image of the plan (JPEG blob) shown live in the 3D scene. */
export async function savePlanPreview(blob: Blob): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, PREVIEW_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
  db.close();
}

export async function loadPlanPreview(): Promise<Blob | null> {
  const db = await openDb();
  if (!db) return null;
  const blob = await new Promise<Blob | null>((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(PREVIEW_KEY);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => resolve(null);
  });
  db.close();
  return blob instanceof Blob ? blob : null;
}

export async function clearPlan(): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(KEY);
    tx.objectStore(STORE).delete(PREVIEW_KEY);
    tx.objectStore(STORE).delete("analysis");
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
  db.close();
}
