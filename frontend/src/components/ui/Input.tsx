import clsx from "clsx";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        "h-11 w-full rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold text-ink outline-none transition focus:border-forest-600",
        className
      )}
      {...props}
    />
  );
}
