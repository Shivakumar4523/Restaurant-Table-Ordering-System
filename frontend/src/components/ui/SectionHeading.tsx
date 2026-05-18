export function SectionHeading({
  eyebrow,
  title,
  body
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mb-6">
      {eyebrow ? (
        <p className="text-xs font-black uppercase text-royal-600 dark:text-gold-300">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-3xl font-black text-ink dark:text-white sm:text-4xl">{title}</h2>
      {body ? <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">{body}</p> : null}
    </div>
  );
}
