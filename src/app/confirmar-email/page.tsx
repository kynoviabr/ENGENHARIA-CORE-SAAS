import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { AuthCard } from "@/components/auth-card";

export default function ConfirmarEmailPage() {
  return (
    <AuthCard
      eyebrow="// Confirmação"
      title="Confirmar e-mail"
      description="Página reservada para tratar links de confirmação enviados pelo Supabase Auth."
    >
      <div className="rounded-lg border border-[var(--border-b)] bg-[var(--accent-soft)] p-4">
        <div className="flex items-center gap-3 text-[14px] font-semibold text-[var(--text)]">
          <CheckCircle2 size={18} className="text-[var(--blue-xl)]" />
          Fluxo aguardando Supabase
        </div>
        <p className="mt-3 text-[13.5px] leading-6 text-[var(--text2)]">
          Quando Auth estiver configurado, esta rota validará tokens de confirmação e redirecionará o usuário para a empresa ativa.
        </p>
      </div>
      <a className="btn btn-outline mt-5 w-full" href="/login">
        <ArrowLeft size={15} />
        Voltar para login
      </a>
    </AuthCard>
  );
}
