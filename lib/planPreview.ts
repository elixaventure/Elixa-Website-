/**
 * Client-side rasteriser for the customer's floor plan, so the 3D scene can
 * display the actual document live. Photos/images are downscaled on a canvas;
 * PDFs have their first page rendered via pdf.js (lazy-loaded, worker served
 * from public/pdfjs so nothing is fetched from a CDN).
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const MAX_DIM = 2400; // high enough that CAD hairline wall boundaries rasterise solid

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85));
}

async function imageToPreview(file: File): Promise<Blob | null> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIM / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    return await canvasToBlob(canvas);
  } catch (e) {
    console.warn("[elixa] plan image preview failed", e);
    return null;
  }
}

async function pdfToPreview(file: File): Promise<Blob | null> {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = `${BASE}/pdfjs/pdf.worker.min.mjs`;
    const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const page = await doc.getPage(1);
    const vp1 = page.getViewport({ scale: 1 });
    const scale = Math.min(3.2, MAX_DIM / Math.max(vp1.width, vp1.height));
    const vp = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    page.cleanup();
    return await canvasToBlob(canvas);
  } catch (e) {
    console.warn("[elixa] plan PDF preview failed", e);
    return null;
  }
}

/** Rasterise an uploaded floor plan (image or PDF) to a JPEG preview blob. */
export async function makePlanPreview(file: File): Promise<Blob | null> {
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return pdfToPreview(file);
  return imageToPreview(file);
}
