import type { ReactNode } from "react";
import type {
  ContractItemListItem,
  ExternalResourceListItem,
} from "@/core/repositories/contract-repository";
import type { Product, ProductModule } from "@/core/types";

interface ContractCommercialFormsProps {
  contractItems: ContractItemListItem[];
  createExternalResourceAction: (formData: FormData) => void | Promise<void>;
  createItemAction: (formData: FormData) => void | Promise<void>;
  createScopeAction: (formData: FormData) => void | Promise<void>;
  externalResources: ExternalResourceListItem[];
  products: Product[];
  modules: ProductModule[];
  startDate: string;
}

export function ContractCommercialForms({
  contractItems,
  createExternalResourceAction,
  createItemAction,
  createScopeAction,
  externalResources,
  products,
  modules,
  startDate,
}: ContractCommercialFormsProps) {
  return (
    <div className="grid gap-6">
      <CommercialForm action={createItemAction} title="Novo item contratual">
        <Field label="Descrição" name="description" required />
        <Field defaultValue="platform" label="Tipo" name="itemType" required />
        <SelectField
          label="Produto"
          name="productId"
          options={[
            { label: "Sem produto", value: "" },
            ...products.map((product) => ({ label: product.name, value: product.id })),
          ]}
        />
        <SelectField
          label="Módulo"
          name="moduleId"
          options={[
            { label: "Produto inteiro", value: "" },
            ...modules.map((module) => ({ label: module.name, value: module.id })),
          ]}
        />
        <SelectField
          defaultValue="flat"
          label="Cobrança"
          name="billingModel"
          options={[
            { label: "Valor fixo", value: "flat" },
            { label: "Por usuário", value: "per_user" },
            { label: "Por recurso", value: "per_resource" },
            { label: "Por unidade", value: "per_unit" },
            { label: "Por uso", value: "usage_based" },
            { label: "Customizado", value: "custom" },
          ]}
        />
        <SelectField defaultValue="active" label="Status" name="status" options={catalogStatusOptions} />
        <Field defaultValue="1" label="Quantidade" name="quantity" required type="number" />
        <Field defaultValue="0" label="Preço unitário" name="unitPrice" required step="0.01" type="number" />
        <Field defaultValue="0" label="Preço total" name="totalPrice" required step="0.01" type="number" />
        <Field defaultValue={dateOnly(startDate)} label="Início" name="startsAt" required type="date" />
        <Field label="Fim" name="endsAt" type="date" />
      </CommercialForm>

      <CommercialForm action={createExternalResourceAction} title="Novo recurso externo">
        <Field defaultValue="workspace" label="Tipo de recurso" name="resourceType" required />
        <Field label="ID externo" name="externalId" required />
        <Field label="Código" name="code" required />
        <Field label="Nome exibido" name="displayName" />
        <SelectField
          label="Produto"
          name="productId"
          options={[
            { label: "Sem produto", value: "" },
            ...products.map((product) => ({ label: product.name, value: product.id })),
          ]}
        />
        <SelectField defaultValue="active" label="Status" name="status" options={catalogStatusOptions} />
      </CommercialForm>

      <CommercialForm action={createScopeAction} title="Novo escopo coberto">
        <SelectField
          label="Item contratual"
          name="contractItemId"
          options={[
            { label: "Sem item", value: "" },
            ...contractItems.map((item) => ({ label: item.description, value: item.id })),
          ]}
        />
        <SelectField
          label="Produto"
          name="productId"
          options={[
            { label: "Sem produto", value: "" },
            ...products.map((product) => ({ label: product.name, value: product.id })),
          ]}
        />
        <p className="md:col-span-2 text-[12.5px] leading-5 text-[var(--text2)]">
          Recursos registrados: {externalResources.length || "nenhum"}
        </p>
        <Field defaultValue="workspace" label="Tipo de recurso" name="resourceType" required />
        <Field label="ID do recurso" name="resourceId" required />
        <Field label="Código do recurso" name="resourceCode" required />
        <Field label="Nome exibido" name="displayName" />
        <SelectField defaultValue="active" label="Status" name="status" options={catalogStatusOptions} />
        <Field defaultValue={dateOnly(startDate)} label="Início" name="startsAt" required type="date" />
        <Field label="Expira em" name="expiresAt" type="date" />
      </CommercialForm>
    </div>
  );
}

interface CommercialFormProps {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  title: string;
}

function CommercialForm({ action, children, title }: CommercialFormProps) {
  return (
    <form action={action} className="grid gap-4 border-t border-[var(--border)] pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-[14px] font-semibold text-[var(--text)]">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
      <div className="flex justify-end">
        <button className="btn btn-outline" type="submit">
          Adicionar
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
          <option key={`${name}-${option.value}`} value={option.value}>
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
  step?: string;
  type?: string;
}

function Field({ defaultValue, label, name, required = false, step, type = "text" }: FieldProps) {
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
        step={step}
        type={type}
      />
    </label>
  );
}

const catalogStatusOptions = [
  { label: "Ativo", value: "active" },
  { label: "Pendente", value: "pending" },
  { label: "Planejado", value: "planned" },
  { label: "Suspenso", value: "suspended" },
];

function dateOnly(value: string): string {
  return value.slice(0, 10);
}
