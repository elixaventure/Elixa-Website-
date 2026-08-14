import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "navy" | "ghost" | "outline";
type Size = "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  navy: "btn-navy",
  ghost: "btn-ghost",
  outline: "btn-outline",
};

export function Button({
  href,
  children,
  variant = "primary",
  size = "lg",
  className,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const classes = cn(variantClass[variant], size === "lg" ? "btn-lg" : "btn-md", className);
  const isInternal = href.startsWith("/");
  if (isInternal) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={classes} {...rest}>
      {children}
    </a>
  );
}
