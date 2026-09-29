/**
 * A star rating, drawn rather than written.
 *
 * "5/5" is information; five filled stars is a thing people feel. Both say
 * the same, so this replaces the text where the rating is the point and
 * keeps the number beside it where an average would otherwise be rounded
 * away — 4.6 and 5.0 both draw five stars, and the difference matters.
 *
 * Accessibility: the stars are decoration and the label carries the value,
 * so a screen reader says "rated 5 out of 5" once, not "star star star".
 */
export function Stars({
  value,
  count,
  size = 14,
  className = "",
}: {
  /** 1–5. Fractions are allowed and fill partially. */
  value: number;
  /** Shown after the stars, e.g. "12 reviews". */
  count?: number;
  size?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(5, value));
  const label = `Rated ${Number.isInteger(clamped) ? clamped : clamped.toFixed(1)} out of 5${
    typeof count === "number" ? ` from ${count} ${count === 1 ? "review" : "reviews"}` : ""
  }`;

  return (
    <span className={`inline-flex items-center gap-2 ${className}`} title={label}>
      <span aria-hidden className="inline-flex items-center gap-[2px]">
        {[0, 1, 2, 3, 4].map((i) => {
          // How much of this particular star is filled: all, none, or the
          // remainder, so 4.6 shows four and a little over half.
          const fill = Math.max(0, Math.min(1, clamped - i));
          return <Star key={i} fill={fill} size={size} />;
        })}
      </span>
      <span className="sr-only">{label}</span>
      {typeof count === "number" && (
        <span className="font-techmono text-[10px] uppercase tracking-[0.16em] text-night-faint">
          {count} {count === 1 ? "review" : "reviews"}
        </span>
      )}
    </span>
  );
}

function Star({ fill, size }: { fill: number; size: number }) {
  const d =
    "M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.4l-5.8 3 1.1-6.4L2.6 9.4l6.5-.9L12 2.6z";
  // A gradient id has to be unique in the document or every star on the page
  // picks up whichever one rendered last. Only partial stars need one.
  const id = fill > 0 && fill < 1 ? `star-${Math.round(fill * 100)}-${size}` : undefined;

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="shrink-0">
      {id && (
        <defs>
          <linearGradient id={id}>
            <stop offset={`${fill * 100}%`} stopColor="currentColor" />
            <stop offset={`${fill * 100}%`} stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <path
        d={d}
        className="text-night-accent"
        fill={fill >= 1 ? "currentColor" : id ? `url(#${id})` : "none"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
