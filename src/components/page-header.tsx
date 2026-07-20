interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <section className="flex flex-col gap-5 rounded-[14px] border border-[var(--border)] bg-[rgba(17,17,18,0.78)] p-6 lg:flex-row lg:items-end lg:justify-between lg:p-8">
      <div>
        <div className="section-label">{eyebrow}</div>
        <h1 className="mt-4 max-w-3xl text-[34px] font-bold leading-none tracking-[-1.8px] text-[var(--text)] md:text-[44px]">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[var(--text2)]">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </section>
  );
}
