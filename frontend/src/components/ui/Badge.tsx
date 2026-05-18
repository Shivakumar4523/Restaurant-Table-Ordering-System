import clsx from "clsx";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={clsx("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-black", className)}>{children}</span>;
}
