import Link from "next/link";
import type { Tenant } from "@/core/types";
import type { ContractListItem } from "@/core/repositories/contract-repository";
import type { Plan } from "@/core/types";

interface ContractFormProps {
  action: (formData: FormData) => void | Promise<void>;
  contract?: ContractListItem;
  plans: Plan[];
  submitLabel: string;
  tenants: Tenant[];
}

export function ContractForm({ action, contract, plans, submitLabel, tenants }: ContractFormProps) {
  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            Empresa
          </span>
          <select
            className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            defaultValue={contract?.tenantId ?? tenants[0]?.id}
            name="tenantId"
            required
          >
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.tradeName}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            Plano
          </span>
          <select
            className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            defaultValue={contract?.planId ?? plans[0]?.id}
            name="planId"
            required
          >
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        </label>

        <Field defaultValue={contract?.contractNumber} label="Número" name="contractNumber" required />

        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            Cobrança
          </span>
          <select
            className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            defaultValue={contract?.billingCycle ?? "monthly"}
            name="billingCycle"
          >
            <option value="monthly">Mensal</option>
            <option value="quarterly">Trimestral</option>
            <option value="yearly">Anual</option>
            <option value="one_time">Única</option>
            <option value="trial">Trial</option>
          </select>
        </label>

        <Field defaultValue={contract?.startDate} label="Inicio" name="startDate" required type="date" />
        <Field defaultValue={contract?.endDate} label="Fim" name="endDate" type="date" />
        <Field defaultValue={contract?.renewalDate} label="Renovação" name="renewalDate" type="date" />

        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            Status
          </span>
          <select
            className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            defaultValue={contract?.status ?? "draft"}
            name="status"
          >
            <option value="draft">Rascunho</option>
            <option value="pending">Pendente</option>
            <option value="active">Ativo</option>
            <option value="expired">Expirado</option>
            <option value="suspended">Suspenso</option>
            <option value="cancelled">Cancelado</option>
            <option value="closed">Fechado</option>
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            Observações
          </span>
          <textarea
            className="mt-2 min-h-28 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-[14px] leading-6 text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            defaultValue={contract?.notes ?? ""}
            name="notes"
          />
        </label>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Link className="btn btn-outline" href="/contratos">
          Cancelar
        </Link>
        <button className="btn btn-primary" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  defaultValue?: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}

function Field({ defaultValue, label, name, required = false, type = "text" }: FieldProps) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
        {label}
      </span>
      <input
        className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
        defaultValue={defaultValue}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}
