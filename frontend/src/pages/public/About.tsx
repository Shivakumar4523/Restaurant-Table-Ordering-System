export function About() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs font-black uppercase text-gold-700">About</p>
      <h1 className="mt-3 text-4xl font-black text-ink">Royal Spice Restaurant blends warm dining with efficient service.</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-700">
        The table ordering system connects waiters, kitchen staff, cashiers, and managers in one flow: order capture, live preparation,
        table status, billing, and reports.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {["Dark green and gold dining identity", "Mobile and tablet friendly staff tools", "Live kitchen and table operations"].map((text) => (
          <div key={text} className="glass rounded-[8px] p-5 text-sm font-bold leading-6 text-stone-700">{text}</div>
        ))}
      </div>
    </main>
  );
}
