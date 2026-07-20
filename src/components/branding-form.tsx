import Link from "next/link";
import type { Tenant } from "@/core/types";
import type { BrandingSettings } from "@/core/types";

interface BrandingFormProps {
  action: (formData: FormData) => void | Promise<void>;
  branding?: BrandingSettings | null;
  selectedTenantId?: string;
  submitLabel: string;
  tenants: Tenant[];
}

export function BrandingForm({
  action,
  branding,
  selectedTenantId,
  submitLabel,
  tenants,
}: BrandingFormProps) {
  const tenantId = branding?.tenantId ?? selectedTenantId ?? tenants[0]?.id;

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
            Empresa
          </span>
          <select
            className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
            defaultValue={tenantId}
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

        <Field defaultValue={branding?.name} label="Nome exibido" name="name" required />
        <ColorField defaultValue={branding?.primaryColor ?? "#2563EB"} label="Cor primaria" name="primaryColor" />
        <ColorField defaultValue={branding?.secondaryColor ?? "#3B82F6"} label="Cor secundaria" name="secondaryColor" />
        <Field defaultValue={branding?.logoUrl ?? ""} label="Logo URL" name="logoUrl" type="url" />
        <Field defaultValue={branding?.smallLogoUrl ?? ""} label="Logo reduzido URL" name="smallLogoUrl" type="url" />
        <Field defaultValue={branding?.faviconUrl ?? ""} label="Favicon URL" name="faviconUrl" type="url" />
        <Field defaultValue={branding?.loginImageUrl ?? ""} label="Imagem login URL" name="loginImageUrl" type="url" />
        <Field defaultValue={branding?.supportEmail} label="E-mail suporte" name="supportEmail" required type="email" />
        <Field defaultValue={branding?.supportPhone} label="Telefone suporte" name="supportPhone" />
        <Field defaultValue={branding?.termsUrl ?? ""} label="Termos URL" name="termsUrl" type="url" />
        <Field defaultValue={branding?.privacyUrl ?? ""} label="Privacidade URL" name="privacyUrl" type="url" />
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Link className="btn btn-outline" href="/configuracoes">
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

function ColorField({ defaultValue, label, name }: Required<Pick<FieldProps, "defaultValue" | "label" | "name">>) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
        {label}
      </span>
      <span className="mt-2 flex h-11 items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3">
        <input className="h-6 w-8 bg-transparent" defaultValue={defaultValue} name={name} type="color" />
        <span className="font-mono text-[12px] text-[var(--text2)]">{defaultValue}</span>
      </span>
    </label>
  );
}
