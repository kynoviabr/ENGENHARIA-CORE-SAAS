interface DataPanelProps {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}

export function DataPanel({ title, eyebrow, children }: DataPanelProps) {
  return (
    <section className="data-card overflow-hidden">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <div className="section-label">{eyebrow}</div>
        <h2 className="mt-1 text-[18px] font-semibold leading-tight text-[var(--text)]">{title}</h2>
      </div>
      {children}
    </section>
  );
}
