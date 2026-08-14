import Link from "next/link";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-white/60">
        {items.map((it, i) => (
          <li key={it.path} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-white/30">/</span>}
            {i < items.length - 1 ? (
              <Link href={it.path} className="hover:text-white">
                {it.name}
              </Link>
            ) : (
              <span className="text-white/90">{it.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
