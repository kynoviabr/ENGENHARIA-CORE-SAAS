interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <section className="page-card flex flex-col gap-5 p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
      <div>
        <div className="section-label">{eyebrow}</div>
        <h1 className="mt-3 max-w-3xl text-[30px] font-semibold leading-tight text-[var(--text)] md:text-[38px]">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-[14px] leading-6 text-[var(--text2)]">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </section>
  );
}
