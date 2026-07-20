import Link from "next/link";
import type { Tenant } from "@/core/types";

interface TenantFormProps {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  tenant?: Tenant;
}

export function TenantForm({ action, submitLabel, tenant }: TenantFormProps) {
  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          defaultValue={tenant?.legalName}
          label="Razao social"
          name="legalName"
          required
        />
        <Field
          defaultValue={tenant?.tradeName}
          label="Nome fantasia"
          name="tradeName"
          required
        />
        <Field defaultValue={tenant?.document} label="Documento" name="document" required />
        <Field defaultValue={tenant?.email} label="E-mail" name="email" required type="email" />
        <Field defaultValue={tenant?.phone} label="Telefone" name="phone" />
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            Status
          </span>
          <select
            className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            defaultValue={tenant?.status ?? "pending"}
            name="status"
          >
            <option value="pending">Pendente</option>
            <option value="active">Ativo</option>
            <option value="suspended">Suspenso</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap justify-end gap-3">
        <Link className="btn btn-outline" href="/empresas">
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
