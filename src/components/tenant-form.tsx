"use client";

import Link from "next/link";
import { useState } from "react";
import type { Tenant } from "@/core/types";

interface TenantFormProps {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  tenant?: Tenant;
}

interface AddressState {
  street: string;
  district: string;
  city: string;
  state: string;
}

export function TenantForm({ action, submitLabel, tenant }: TenantFormProps) {
  const [cnpj, setCnpj] = useState(tenant?.document ?? "");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState<AddressState>({
    street: "",
    district: "",
    city: "",
    state: "",
  });
  const [zipStatus, setZipStatus] = useState<"idle" | "loading" | "found" | "error">("idle");

  async function handleZipBlur() {
    const normalizedZip = zipCode.replace(/\D/g, "");

    if (normalizedZip.length !== 8) {
      setZipStatus(normalizedZip.length > 0 ? "error" : "idle");
      return;
    }

    setZipStatus("loading");

    try {
      const response = await fetch(`/api/cep?cep=${normalizedZip}`);

      if (!response.ok) {
        setZipStatus("error");
        return;
      }

      const data = (await response.json()) as Partial<AddressState>;
      setAddress({
        street: data.street ?? "",
        district: data.district ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
      });
      setZipStatus("found");
    } catch {
      setZipStatus("error");
    }
  }

  return (
    <form action={action} className="grid gap-4">
      <section className="grid gap-3">
        <SectionTitle title="Dados da empresa" />
        <div className="grid gap-3 md:grid-cols-2">
          <Field defaultValue={tenant?.legalName} label="Razão social" name="legalName" required />
          <Field defaultValue={tenant?.tradeName} label="Nome fantasia" name="tradeName" required />
          <Field
            label="CNPJ"
            maxLength={18}
            name="document"
            onChange={(event) => setCnpj(formatAlphaNumericCnpj(event.target.value))}
            placeholder="00.000.000/0000-00"
            required
            value={cnpj}
          />
          <label className="block">
            <span className="field-label">Status</span>
            <select
              className="field-control"
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
      </section>

      <section className="grid gap-3">
        <SectionTitle title="Endereço" />
        <div className="grid gap-3 md:grid-cols-[160px_1fr_120px]">
          <Field
            label="CEP"
            maxLength={9}
            name="zipCode"
            onBlur={handleZipBlur}
            onChange={(event) => setZipCode(formatZipCode(event.target.value))}
            placeholder="00000-000"
            value={zipCode}
          />
          <Field
            label="Logradouro"
            name="street"
            onChange={(event) => setAddress((current) => ({ ...current, street: event.target.value }))}
            value={address.street}
          />
          <Field label="Número" name="addressNumber" />
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_120px]">
          <Field label="Complemento" name="addressComplement" />
          <Field
            label="Bairro"
            name="district"
            onChange={(event) => setAddress((current) => ({ ...current, district: event.target.value }))}
            value={address.district}
          />
          <Field
            label="UF"
            maxLength={2}
            name="state"
            onChange={(event) => setAddress((current) => ({ ...current, state: event.target.value.toUpperCase() }))}
            value={address.state}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Cidade"
            name="city"
            onChange={(event) => setAddress((current) => ({ ...current, city: event.target.value }))}
            value={address.city}
          />
          <ZipStatus status={zipStatus} />
        </div>
      </section>

      <section className="grid gap-3">
        <SectionTitle title="Contato principal" />
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Nome do contato" name="contactName" />
          <Field defaultValue={tenant?.email} label="E-mail" name="email" required type="email" />
          <Field defaultValue={tenant?.phone} label="Telefone" name="phone" type="tel" />
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-2">
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

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-[14px] font-semibold leading-tight text-[var(--text)]">{title}</h3>;
}

function ZipStatus({ status }: { status: "idle" | "loading" | "found" | "error" }) {
  const messages = {
    idle: "",
    loading: "Buscando CEP...",
    found: "Endereço preenchido pelo CEP.",
    error: "CEP não encontrado ou inválido.",
  };

  return (
    <div className="flex items-end">
      <p className={`pb-2 text-[12.5px] ${status === "error" ? "text-red-600" : "text-[var(--text2)]"}`}>
        {messages[status]}
      </p>
    </div>
  );
}

interface FieldProps {
  defaultValue?: string;
  label: string;
  maxLength?: number;
  name: string;
  onBlur?: () => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value?: string;
}

function Field({
  defaultValue,
  label,
  maxLength,
  name,
  onBlur,
  onChange,
  placeholder,
  required = false,
  type = "text",
  value,
}: FieldProps) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        className="field-control"
        defaultValue={value === undefined ? defaultValue : undefined}
        maxLength={maxLength}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function formatZipCode(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatAlphaNumericCnpj(value: string) {
  const raw = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 14);
  const parts = [
    raw.slice(0, 2),
    raw.slice(2, 5),
    raw.slice(5, 8),
    raw.slice(8, 12),
    raw.slice(12, 14),
  ].filter(Boolean);

  if (parts.length <= 1) return parts[0] ?? "";
  if (parts.length === 2) return `${parts[0]}.${parts[1]}`;
  if (parts.length === 3) return `${parts[0]}.${parts[1]}.${parts[2]}`;
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}/${parts[3]}`;
  return `${parts[0]}.${parts[1]}.${parts[2]}/${parts[3]}-${parts[4]}`;
}
