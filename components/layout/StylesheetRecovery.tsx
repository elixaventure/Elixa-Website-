/**
 * Recovers a page that loaded without its stylesheet.
 *
 * Next fingerprints the stylesheet — /_next/static/css/<hash>.css — and the
 * hash changes whenever the CSS changes. A deploy replaces that file, and the
 * old name stops existing. GitHub Pages serves HTML with a ten-minute cache,
 * so for a few minutes after every deploy a browser (or a CDN edge) can hold
 * HTML from the previous build and ask for a stylesheet that has just been
 * deleted. It 404s, and the page renders as raw browser defaults: blue
 * underlined links, navigation labels run together, no layout. Images survive,
 * because their filenames never change — which is why it looks like the CSS
 * alone has vanished. It has.
 *
 * So: read back a custom property the stylesheet defines. If it isn't there,
 * the stylesheet isn't there, and the HTML is stale. Reload with a one-off
 * query string, which no cache has an entry for, so the fresh HTML — naming
 * the stylesheet that does exist — has to come from the server.
 *
 * Inline on purpose. Every other script on the page is fingerprinted too, so
 * the files that would carry this are exactly the files that are missing.
 */

const SCRIPT = `(function(){
  var KEY = 'elixa-sheet-retry', MARK = 'sheet';
  function styled(){
    try {
      return getComputedStyle(document.documentElement).getPropertyValue('--sheet').trim() === '1';
    } catch (e) { return true; }
  }
  function tidy(){
    // Drop the cache-busting marker from the address bar so it is never
    // bookmarked or shared.
    try {
      var u = new URL(location.href);
      if (u.searchParams.has(MARK)) {
        u.searchParams.delete(MARK);
        history.replaceState(null, '', u.pathname + (u.search || '') + u.hash);
      }
    } catch (e) {}
  }
  function check(){
    if (styled()) {
      // Cleared on every healthy load, so a visitor whose HTML is still
      // stale gets the same recovery again next time rather than being
      // left on a permanently unstyled page.
      try { sessionStorage.removeItem(KEY); } catch (e) {}
      return;
    }
    var tried = false, canRemember = false;
    try {
      tried = sessionStorage.getItem(KEY) === '1';
      sessionStorage.setItem(KEY, '1');
      canRemember = sessionStorage.getItem(KEY) === '1';
    } catch (e) {}
    // One attempt only, and only if the attempt can be remembered — a page
    // stuck without CSS is poor; a page reloading forever is worse.
    if (tried || !canRemember) return;
    try {
      var u = new URL(location.href);
      u.searchParams.set(MARK, Date.now().toString(36));
      location.replace(u.toString());
    } catch (e) {}
  }
  // Straight away, before the framework's own scripts run: whether or not
  // the stylesheet made it, the marker has done its job and should not stay
  // in the address bar. Doing it here rather than on load means it happens
  // before hydration reads the URL, so nothing puts it back.
  tidy();
  if (document.readyState === 'complete') check();
  else addEventListener('load', check);
})();`;

export function StylesheetRecovery() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
