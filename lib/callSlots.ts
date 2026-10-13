/**
 * When the customer would like to be rung.
 *
 * Not a booking. The installers' app has a calendar, but it publishes no
 * availability — projects sit on it as date blocks, and there is nothing
 * the website could read to know whether a Tuesday at two is free. Showing
 * genuine slots and reserving one would mean building availability
 * publishing, a booking endpoint and conflict handling first, and offering
 * a slot that turns out to be taken is worse than not offering one.
 *
 * So this asks a preference and sends it with the enquiry. The office
 * rings then. It is the honest version of the same thing, and it is what
 * the copy says: "we'll call you Tuesday afternoon", never "your call is
 * booked".
 *
 * Everything here runs in the browser rather than at build time. A static
 * page built on Monday would otherwise still be offering Monday as "today"
 * on Thursday.
 */

export interface Slot {
  key: string;
  label: string;
  /** Spoken back in the confirmation, where "Today" would read oddly. */
  spoken: string;
  /**
   * The actual date, YYYY-MM-DD.
   *
   * Carried because "tomorrow" is only true for about a day. The enquiry
   * is read by a person on a phone and by a diary that needs a date, and
   * a note saying "tomorrow in the afternoon" opened on Thursday points
   * at the wrong day with no way to tell.
   */
  date?: string;
}

/** After this hour, offering a call back today is not a real offer. */
const TOO_LATE = 16;

const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "the 15th", not "the 15" — this is read back to a person. */
function ordinal(n: number) {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}
const SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * The next few days worth offering.
 *
 * Sundays are left out and Saturdays are not — this is a trade, and the
 * people who most want a Saturday call are the ones who cannot take one
 * midweek.
 */
export function callDays(now = new Date()): Slot[] {
  const out: Slot[] = [];
  for (let i = 0; out.length < 5 && i < 10; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    if (d.getDay() === 0) continue;
    if (i === 0 && now.getHours() >= TOO_LATE) continue;
    // Local parts rather than toISOString(), which converts to UTC and
    // turns a late-evening Tuesday into Wednesday.
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    out.push(
      i === 0
        ? { key: "today", label: "Today", spoken: "today", date: iso }
        : i === 1
          ? { key: "tomorrow", label: "Tomorrow", spoken: "tomorrow", date: iso }
          : {
              key: `d${i}`,
              label: `${SHORT[d.getDay()]} ${d.getDate()}`,
              spoken: `${DAY[d.getDay()]} the ${ordinal(d.getDate())}`,
              date: iso,
            },
    );
  }
  return out;
}

export const CALL_TIMES: Slot[] = [
  { key: "morning", label: "Morning", spoken: "in the morning" },
  { key: "afternoon", label: "Afternoon", spoken: "in the afternoon" },
  { key: "evening", label: "After 5", spoken: "after five" },
];

/** What the enquiry carries, and what the confirmation says back. */
export function describeCall(day?: Slot, time?: Slot): string {
  if (!day && !time) return "";
  if (day && time) return `${day.spoken} ${time.spoken}`;
  return (day?.spoken ?? time?.spoken) as string;
}
