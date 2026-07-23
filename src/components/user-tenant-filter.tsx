"use client";

import { useRouter } from "next/navigation";
import type { Tenant } from "@/core/types";

interface UserTenantFilterProps {
  selectedTenantId: string;
  tenants: Tenant[];
}

export function UserTenantFilter({ selectedTenantId, tenants }: UserTenantFilterProps) {
  const router = useRouter();

  return (
    <label className="block">
      <span className="field-label">Empresa</span>
      <select
        className="field-control min-w-[280px]"
        onChange={(event) => router.push(`/usuarios?tenantId=${encodeURIComponent(event.target.value)}`)}
        value={selectedTenantId}
      >
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.tradeName}
          </option>
        ))}
      </select>
    </label>
  );
}
