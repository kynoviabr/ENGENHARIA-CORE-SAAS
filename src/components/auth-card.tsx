import Link from "next/link";

interface AuthCardProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthCard({ eyebrow, title, description, children }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] px-5 py-12">
      <section className="page-card w-full max-w-[440px] p-6 shadow-[var(--shadow-md)] md:p-8">
        <Link className="text-[16px] font-semibold text-[var(--blue)]" href="/">
          Kynovia
        </Link>
        <div className="section-label mt-10">{eyebrow}</div>
        <h1 className="mt-4 text-[32px] font-semibold leading-tight text-[var(--text)]">
          {title}
        </h1>
        <p className="mt-4 text-[14.5px] leading-6 text-[var(--text2)]">{description}</p>
        <div className="mt-7">{children}</div>
      </section>
    </main>
  );
}
