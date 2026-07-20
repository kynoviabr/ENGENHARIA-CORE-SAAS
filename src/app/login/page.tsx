import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";

export default function LoginPage() {
  return (
    <AuthCard
      eyebrow="// Acesso"
      title="Entrar no Core"
      description="Fluxo preparado para Supabase Auth. Enquanto a autenticação real não estiver ativa, o painel usa uma sessão mock segura."
    >
      <form className="space-y-4">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            E-mail
          </span>
          <input
            className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            defaultValue="amanda@kynovia.com.br"
            type="email"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            Senha
          </span>
          <input
            className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            placeholder="••••••••"
            type="password"
          />
        </label>
        <Link className="btn btn-primary w-full" href="/">
          Entrar em modo mock
          <ArrowRight size={15} />
        </Link>
        <button className="btn btn-outline w-full" type="button">
          <Mail size={15} />
          Continuar com Google
        </button>
      </form>
      <div className="mt-5 flex items-center justify-between text-[13px] text-[var(--text3)]">
        <a className="hover:text-[var(--text2)]" href="/recuperar-senha">
          Recuperar senha
        </a>
        <a className="hover:text-[var(--text2)]" href="/confirmar-email">
          Confirmar e-mail
        </a>
      </div>
    </AuthCard>
  );
}
