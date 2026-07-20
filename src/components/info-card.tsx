interface InfoCardProps {
  label: string;
  value: string;
  detail: string;
}

export function InfoCard({ label, value, detail }: InfoCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-5 transition hover:bg-[var(--bg3)]">
      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
        {label}
      </div>
      <div className="mt-4 break-words text-[28px] font-bold leading-none tracking-[-1.5px] text-[var(--text)]">
        {value}
      </div>
      <div className="mt-3 text-[12.5px] leading-5 text-[var(--text2)]">{detail}</div>
    </div>
  );
}
