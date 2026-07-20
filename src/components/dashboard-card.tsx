interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardCard({ children, className = "" }: DashboardCardProps) {
  return (
    <section
      className={`rounded-xl border border-[var(--border)] bg-[var(--bg2)] ${className}`}
    >
      {children}
    </section>
  );
}
