import Link from "next/link";
import type { Product, ProductModule, Tenant } from "@/core/types";
import type { EntitlementListItem } from "@/core/repositories/catalog-repository";

interface EntitlementFormProps {
  action: (formData: FormData) => void | Promise<void>;
  entitlement?: EntitlementListItem;
  modules: ProductModule[];
  products: Product[];
  submitLabel: string;
  tenants: Tenant[];
}

export function EntitlementForm({
  action,
  entitlement,
  modules,
  products,
  submitLabel,
  tenants,
}: EntitlementFormProps) {
  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          defaultValue={entitlement?.tenantId ?? tenants[0]?.id}
          label="Empresa"
          name="tenantId"
          options={tenants.map((tenant) => ({ label: tenant.tradeName, value: tenant.id }))}
        />
        <SelectField
          defaultValue={entitlement?.productId ?? products[0]?.id}
          label="Produto"
          name="productId"
          options={products.map((product) => ({ label: product.name, value: product.id }))}
        />
        <SelectField
          defaultValue={entitlement?.moduleId ?? ""}
          label="Módulo"
          name="moduleId"
          options={[
            { label: "Produto inteiro", value: "" },
            ...modules.map((module) => ({ label: module.name, value: module.id })),
          ]}
        />
        <SelectField
          defaultValue={entitlement?.source ?? "manual"}
          label="Origem"
          name="source"
          options={[
            { label: "Manual", value: "manual" },
            { label: "Plano", value: "plan" },
            { label: "Contrato", value: "contract" },
            { label: "Assinatura", value: "subscription" },
            { label: "Trial", value: "trial" },
            { label: "Core", value: "core" },
          ]}
        />
        <SelectField
          defaultValue={entitlement?.status ?? "active"}
          label="Status"
          name="status"
          options={[
            { label: "Ativo", value: "active" },
            { label: "Pendente", value: "pending" },
            { label: "Planejado", value: "planned" },
            { label: "Suspenso", value: "suspended" },
          ]}
        />
        <Field defaultValue={dateOnly(entitlement?.startsAt)} label="Início" name="startsAt" required type="date" />
        <Field defaultValue={dateOnly(entitlement?.expiresAt)} label="Expira em" name="expiresAt" type="date" />
        <Field defaultValue={entitlement?.sourceId ?? ""} label="ID de origem" name="sourceId" />
        <Field defaultValue={entitlement?.resourceType ?? ""} label="Tipo de recurso" name="resourceType" />
        <Field defaultValue={entitlement?.resourceId ?? ""} label="ID do recurso" name="resourceId" />
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Link className="btn btn-outline" href="/modulos">
          Cancelar
        </Link>
        <button className="btn btn-primary" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  defaultValue?: string;
  label: string;
  name: string;
  options: SelectOption[];
}

function SelectField({ defaultValue, label, name, options }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
        {label}
      </span>
      <select
        className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
        defaultValue={defaultValue}
        name={name}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
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

function dateOnly(value?: string | null): string | undefined {
  return value ? value.slice(0, 10) : undefined;
}
