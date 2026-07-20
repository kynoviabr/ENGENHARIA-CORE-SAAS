import Link from "next/link";
import type { Permission, Role, Tenant } from "@/core/types";

interface RoleFormProps {
  action: (formData: FormData) => void | Promise<void>;
  permissions: Permission[];
  role?: Role;
  submitLabel: string;
  tenants: Tenant[];
}

export function RoleForm({ action, permissions, role, submitLabel, tenants }: RoleFormProps) {
  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field defaultValue={role?.name} label="Nome do papel" name="name" required />

        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            Escopo
          </span>
          <select
            className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            defaultValue={role?.scope ?? "tenant"}
            name="scope"
          >
            <option value="tenant">Tenant</option>
            <option value="global">Global</option>
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            Empresa
          </span>
          <select
            className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            defaultValue={role?.tenantId ?? tenants[0]?.id ?? ""}
            name="tenantId"
          >
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.tradeName}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            Descrição
          </span>
          <textarea
            className="mt-2 min-h-28 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-[14px] leading-6 text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            defaultValue={role?.description}
            name="description"
            required
          />
        </label>
      </div>

      <section>
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
          Permissões
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {permissions.map((permission) => (
            <label
              className="flex min-h-12 items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-[13px] text-[var(--text2)]"
              key={permission.id}
            >
              <input
                className="h-4 w-4 accent-[var(--blue-xl)]"
                defaultChecked={role?.permissionIds.includes(permission.id)}
                name="permissionIds"
                type="checkbox"
                value={permission.id}
              />
              <span>
                <span className="block font-mono text-[12px] text-[var(--text)]">{permission.code}</span>
                <span className="mt-1 block text-[12px] leading-5">{permission.description}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <Link className="btn btn-outline" href="/acesso">
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
}

function Field({ defaultValue, label, name, required = false }: FieldProps) {
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
        type="text"
      />
    </label>
  );
}
