interface DataPanelProps {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}

export function DataPanel({ title, eyebrow, children }: DataPanelProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg2)]">
      <div className="border-b border-[var(--border)] p-5">
        <div className="section-label">{eyebrow}</div>
        <h2 className="mt-2 text-xl font-bold tracking-[-0.8px]">{title}</h2>
      </div>
      {children}
    </section>
  );
}
