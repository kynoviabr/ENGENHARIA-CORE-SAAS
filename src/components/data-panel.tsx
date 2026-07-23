interface DataPanelProps {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}

export function DataPanel({ title, children }: DataPanelProps) {
  return (
    <section className="data-card overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-[17px] font-semibold leading-tight text-[var(--text)]">{title}</h2>
      </div>
      {children}
    </section>
  );
}
