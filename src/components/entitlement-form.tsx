"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product, Tenant } from "@/core/types";
import type { ContractListItem } from "@/core/repositories/contract-repository";
import type { EntitlementListItem } from "@/core/repositories/catalog-repository";

interface EntitlementFormProps {
  action: (formData: FormData) => void | Promise<void>;
  contracts: ContractListItem[];
  entitlement?: EntitlementListItem;
  products: Product[];
  submitLabel: string;
  tenants: Tenant[];
}

export function EntitlementForm({
  action,
  contracts,
  entitlement,
  products,
  submitLabel,
  tenants,
}: EntitlementFormProps) {
  const initialTenantId = entitlement?.tenantId ?? tenants[0]?.id ?? "";
  const defaultContractId = entitlement?.source === "contract" ? entitlement.sourceId ?? "" : "";
  const [selectedTenantId, setSelectedTenantId] = useState(initialTenantId);
  const availableContracts = useMemo(
    () => contracts.filter((contract) => contract.tenantId === selectedTenantId),
    [contracts, selectedTenantId],
  );
  const initialContractId = contracts.some((contract) => contract.id === defaultContractId)
    ? defaultContractId
    : contracts.find((contract) => contract.tenantId === initialTenantId)?.id ?? "";
  const [selectedContractId, setSelectedContractId] = useState(initialContractId);
  const effectiveContractId = availableContracts.some((contract) => contract.id === selectedContractId)
    ? selectedContractId
    : availableContracts[0]?.id ?? "";

  function handleTenantChange(tenantId: string) {
    setSelectedTenantId(tenantId);
    setSelectedContractId(contracts.find((contract) => contract.tenantId === tenantId)?.id ?? "");
  }

  return (
    <form action={action} className="grid gap-5">
      <input name="moduleId" type="hidden" value="" />
      <input name="source" type="hidden" value="contract" />
      <input name="resourceType" type="hidden" value="" />
      <input name="resourceId" type="hidden" value="" />
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          onChange={handleTenantChange}
          label="Empresa"
          name="tenantId"
          options={tenants.map((tenant) => ({ label: tenant.tradeName, value: tenant.id }))}
          value={selectedTenantId}
        />
        <SelectField
          defaultValue={entitlement?.productId ?? products[0]?.id}
          label="Sistema"
          name="productId"
          options={products.map((product) => ({ label: product.name, value: product.id }))}
        />
        <SelectField
          disabled={availableContracts.length === 0}
          label="Contrato"
          name="sourceId"
          options={availableContracts.map((contract) => ({
            label: `${contract.contractNumber} - ${contract.tenantName}`,
            value: contract.id,
          }))}
          onChange={setSelectedContractId}
          value={effectiveContractId}
        />
        {availableContracts.length === 0 ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg3)] p-4 text-[13.5px] leading-6 text-[var(--text2)] md:col-span-2">
            Esta empresa ainda não possui contrato cadastrado. Crie o contrato antes de liberar um sistema.
          </div>
        ) : null}
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
  disabled?: boolean;
  label: string;
  name: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  value?: string;
}

function SelectField({ defaultValue, disabled = false, label, name, onChange, options, value }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text3)]">
        {label}
      </span>
      <select
        className="mt-2 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--border-b)]"
        defaultValue={defaultValue}
        disabled={disabled}
        name={name}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        required
        value={value}
      >
        {options.length === 0 ? (
          <option value="">Nenhuma opção disponível</option>
        ) : null}
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
