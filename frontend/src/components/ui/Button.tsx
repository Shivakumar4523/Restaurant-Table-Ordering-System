import clsx from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "tap-target inline-flex items-center justify-center gap-2 rounded-full px-5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-forest-700 text-white shadow-glow hover:bg-forest-600",
        variant === "secondary" && "bg-gold-300 text-forest-900 hover:bg-gold-500",
        variant === "ghost" && "border border-black/10 bg-white/75 text-ink hover:border-gold-300",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className
      )}
      {...props}
    />
  );
}
