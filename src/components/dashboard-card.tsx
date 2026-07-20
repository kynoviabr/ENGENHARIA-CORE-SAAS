interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardCard({ children, className = "" }: DashboardCardProps) {
  return (
    <section
      className={`data-card ${className}`}
    >
      {children}
    </section>
  );
}
