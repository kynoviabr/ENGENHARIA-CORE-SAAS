import Link from "next/link";

interface AuthCardProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthCard({ eyebrow, title, description, children }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-[440px] rounded-[14px] border border-[var(--border)] bg-[rgba(17,17,18,0.88)] p-6 shadow-2xl shadow-black/30 md:p-8">
        <Link className="logo" href="/">
          Kynov<b>ia</b>
        </Link>
        <div className="section-label mt-10">{eyebrow}</div>
        <h1 className="mt-4 text-[34px] font-bold leading-none tracking-[-1.8px] text-[var(--text)]">
          {title}
        </h1>
        <p className="mt-4 text-[14.5px] leading-6 text-[var(--text2)]">{description}</p>
        <div className="mt-7">{children}</div>
      </section>
    </main>
  );
}
