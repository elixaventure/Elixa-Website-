/**
 * The routes rebuilt in the dark v2 design.
 *
 * These carry their own navigation and footer, so the classic light chrome
 * is hidden on them and the v2 mobile chrome is shown instead. As inner
 * pages are rebuilt, add them here — the two decisions have to stay in step
 * or a page ends up with both sets or neither, which is how /completed came
 * to render two footers.
 */
export const V2_ROUTES = new Set([
  "/",
  "/air-source-heat-pumps",
  "/solar-pv",
  "/thermaskirt",
  "/underfloor-heating",
  "/battery-storage",
  "/ev-charging",
  "/air-conditioning",
  "/projects",
  "/completed",
  "/case-studies",
  "/grants-funding",
  "/about",
  "/contact",
  "/quote",
  "/quick-quote",
]);

export function isV2Route(pathname: string | null | undefined): boolean {
  const path = pathname?.replace(/\/$/, "") || "/";
  return V2_ROUTES.has(path) || pathname === "/" || path.startsWith("/case-studies/");
}
