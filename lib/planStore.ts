/**
 * Small IndexedDB store for the customer's uploaded floor plan, so a file
 * added in the Smart Energy Home carries through to the quote wizard (and is
 * submitted with the lead for the heat-loss calculation). Static-site safe;
 * all methods fail soft to null/no-op where storage is unavailable.
 */

const DB = "elixa";
const STORE = "floor-plan";
const KEY = "current";

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

export async function clearPlan(): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
  db.close();
}
