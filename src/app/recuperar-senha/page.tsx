import { ArrowLeft, Send } from "lucide-react";
import { AuthCard } from "@/components/auth-card";

export default function RecuperarSenhaPage() {
  return (
    <AuthCard
      eyebrow="// Recuperação"
      title="Recuperar senha"
      description="Este formulário será conectado ao reset de senha do Supabase Auth quando a autenticação real estiver ativa."
    >
      <form className="space-y-4">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            E-mail cadastrado
          </span>
          <input
            className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            placeholder="voce@empresa.com"
            type="email"
          />
        </label>
        <button className="btn btn-primary w-full" type="button">
          Enviar instrução
          <Send size={15} />
        </button>
        <a className="btn btn-outline w-full" href="/login">
          <ArrowLeft size={15} />
          Voltar para login
        </a>
      </form>
    </AuthCard>
  );
}
