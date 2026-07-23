import Link from "next/link";
import type { Product } from "@/core/types";

interface ProductFormProps {
  action: (formData: FormData) => void | Promise<void>;
  product?: Product;
  submitLabel: string;
}

export function ProductForm({ action, product, submitLabel }: ProductFormProps) {
  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field defaultValue={product?.name ?? ""} label="Nome do sistema" name="name" placeholder="Ex.: BTT" required />
        <Field defaultValue={product?.code ?? ""} label="Código" name="code" placeholder="Ex.: pmt" required />
        <SelectField
          defaultValue={product?.status ?? "active"}
          label="Status"
          name="status"
          options={[
            { label: "Ativo", value: "active" },
            { label: "Pendente", value: "pending" },
            { label: "Planejado", value: "planned" },
            { label: "Suspenso", value: "suspended" },
          ]}
        />
        <label className="block md:col-span-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            Descrição
          </span>
          <textarea
            className="mt-2 min-h-[96px] w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            defaultValue={product?.description ?? ""}
            name="description"
            placeholder="Descreva o objetivo do sistema dentro do Core."
            required
          />
        </label>
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
  placeholder?: string;
  required?: boolean;
}

function Field({ defaultValue, label, name, placeholder, required = false }: FieldProps) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
        {label}
      </span>
      <input
        className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}
