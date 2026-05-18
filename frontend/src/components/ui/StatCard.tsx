export function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="glass rounded-[8px] p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-forest-700">{label}</p>
      <p className="mt-2 text-2xl font-black text-ink">{value}</p>
    </div>
  );
}
