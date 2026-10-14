/**
 * The appointment, in the customer's own calendar.
 *
 * Somebody who has just agreed to be at home for an hour on a Thursday
 * will not remember it on the Wednesday, and the reminder we can give
 * them costs us nothing: a calendar file their phone already knows how
 * to open. Everything here runs in the browser — this is a static site
 * and there is nothing to generate it server-side.
 *
 * Two things it deliberately does not do:
 *
 * It does not claim a time we have not agreed. The visitor picked a
 * morning or an afternoon, not a two o'clock, so the entry covers the
 * window they picked and says which it is. Writing 09:00 because that
 * is where the window starts would put a wrong time in somebody's
 * diary and we would be the ones who look unreliable at half past ten.
 *
 * It does not mark them busy. TRANSP:TRANSPARENT, because the survey
 * is pencilled in until the call confirms it, and a provisional block
 * should not stop them accepting something real.
 */

export interface IcsBooking {
  /** YYYY-MM-DD, local parts. */
  date: string;
  /** morning | afternoon | evening, or empty if they did not say. */
  window: string;
  title: string;
  notes: string;
}

/**
 * When each window runs.
 *
 * Wider than the appointment itself on purpose: it is the span we might
 * arrive in, which is the thing worth having in a diary.
 */
const WINDOWS: Record<string, [number, number]> = {
  morning: [8, 12],
  afternoon: [12, 17],
  evening: [17, 19],
};

const pad = (n: number) => String(n).padStart(2, "0");

/** YYYYMMDD, out of a YYYY-MM-DD that has already been validated. */
const compact = (date: string) => date.replace(/-/g, "");

/**
 * A line, folded if it is long.
 *
 * RFC 5545 caps a line at 75 octets and some calendars do drop the
 * overflow rather than tolerate it — which would take the address or
 * the phone number off the end of the description.
 */
function fold(line: string): string {
  if (line.length <= 73) return line;
  const out: string[] = [line.slice(0, 73)];
  let rest = line.slice(73);
  while (rest.length > 72) {
    out.push(" " + rest.slice(0, 72));
    rest = rest.slice(72);
  }
  if (rest) out.push(" " + rest);
  return out.join("\r\n");
}

/** Commas, semicolons and newlines all mean something in a calendar file. */
const esc = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/**
 * The day after, as YYYYMMDD.
 *
 * An all-day event's DTEND is exclusive, so a one-day entry ends on the
 * next day. Built from the parts rather than from a timestamp, so that
 * an hour of daylight saving cannot move it.
 */
function dayAfter(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const next = new Date(y, m - 1, d + 1);
  return `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`;
}

function stamp(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
  );
}

function event(b: IcsBooking, now: Date, i: number): string[] {
  const span = WINDOWS[b.window];
  const day = compact(b.date);
  // No window means no hours to give, so it goes in as an all-day entry
  // rather than as a guess. DTEND on an all-day event is exclusive.
  const when = span
    ? [`DTSTART:${day}T${pad(span[0])}0000`, `DTEND:${day}T${pad(span[1])}0000`]
    : [`DTSTART;VALUE=DATE:${day}`, `DTEND;VALUE=DATE:${dayAfter(b.date)}`];

  return [
    "BEGIN:VEVENT",
    `UID:${day}-${i}-${Math.random().toString(36).slice(2, 10)}@elixarenewables.co.uk`,
    `DTSTAMP:${stamp(now)}`,
    ...when,
    fold(`SUMMARY:${esc(b.title)}`),
    fold(`DESCRIPTION:${esc(b.notes)}`),
    "STATUS:TENTATIVE",
    // Pencilled in, so it must not stop them accepting something real.
    "TRANSP:TRANSPARENT",
    // No alarm of our own. Two hours before an eight o'clock window is a
    // six in the morning alert about an appointment that has not even
    // been confirmed yet, and their calendar already reminds them the
    // way they have asked it to.
    "END:VEVENT",
  ];
}

/** The file, or null when there is nothing worth putting in a diary. */
export function buildIcs(bookings: IcsBooking[], now = new Date()): string | null {
  const real = bookings.filter((b) => /^\d{4}-\d{2}-\d{2}$/.test(b.date));
  if (!real.length) return null;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Elixa Renewables//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...real.flatMap((b, i) => event(b, now, i)),
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

/**
 * Hand it to the browser.
 *
 * A blob rather than a link to a file, because there is no file — the
 * appointment is whatever this visitor just picked. Phones open an .ics
 * in the calendar app; a desktop downloads it, which is also the right
 * answer there.
 */
export function downloadIcs(text: string, name = "elixa-appointment.ics") {
  const url = URL.createObjectURL(new Blob([text], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoked late: Safari has been known to cancel the download if the
  // URL goes away while it is still reading it.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
