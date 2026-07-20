import Link from "next/link";
import type { Role, Tenant } from "@/core/types";
import type { UserMembershipListItem } from "@/core/repositories/user-repository";

interface UserMembershipFormProps {
  action: (formData: FormData) => void | Promise<void>;
  roles: Role[];
  submitLabel: string;
  tenants: Tenant[];
  membership?: UserMembershipListItem;
}

export function UserMembershipForm({
  action,
  roles,
  submitLabel,
  tenants,
  membership,
}: UserMembershipFormProps) {
  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field defaultValue={membership?.name} label="Nome" name="name" required />
        <Field defaultValue={membership?.email} label="E-mail" name="email" required type="email" />

        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            Empresa
          </span>
          <select
            className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            defaultValue={membership?.tenantId ?? tenants[0]?.id}
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
            Papel
          </span>
          <select
            className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            defaultValue={membership?.roleId ?? roles[0]?.id}
            name="roleId"
            required
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            Status do vínculo
          </span>
          <select
            className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            defaultValue={membership?.status ?? "invited"}
            name="status"
          >
            <option value="invited">Convidado</option>
            <option value="active">Ativo</option>
            <option value="suspended">Suspenso</option>
            <option value="removed">Removido</option>
          </select>
        </label>

        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            Status do usuário
          </span>
          <select
            className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            defaultValue={membership?.userStatus ?? "invited"}
            name="userStatus"
          >
            <option value="invited">Convidado</option>
            <option value="active">Ativo</option>
            <option value="suspended">Suspenso</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Link className="btn btn-outline" href="/usuarios">
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
