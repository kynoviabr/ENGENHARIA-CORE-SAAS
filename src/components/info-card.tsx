interface InfoCardProps {
  label: string;
  value: string;
  detail: string;
}

export function InfoCard({ label, value, detail }: InfoCardProps) {
  return (
    <div className="data-card p-4 transition hover:border-[var(--border-b)]">
      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
        {label}
      </div>
      <div className="mt-3 break-words text-[24px] font-semibold leading-none text-[var(--text)]">
        {value}
      </div>
      <div className="mt-3 text-[12.5px] leading-5 text-[var(--text2)]">{detail}</div>
    </div>
  );
}
