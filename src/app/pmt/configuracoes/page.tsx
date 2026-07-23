import { requirePermission } from "@/core/auth/session";
import { activityCodes } from "@/features/pmt/services/activity-codes";
import { benchmarkCatalog, calculationMemoryCatalog, hierarchyCatalog, roleCatalog } from "@/features/pmt/services/system-catalogs";
import { SettingsCatalogManager } from "./settings-catalog-manager";

export default async function SettingsPage() {
  await requirePermission("pmt.settings.manage");

  return (
    <div className="page-stack settings-page">
      <section className="page-heading">
        <div>
          <h1>Configurações Globais do BTT</h1>
          <p>Cadastros globais aplicados a todos os clientes e projetos.</p>
        </div>
      </section>

      <SettingsCatalogManager
        initialActivities={activityCodes}
        initialHierarchy={hierarchyCatalog}
        initialRoles={roleCatalog}
        initialBenchmarks={benchmarkCatalog}
        initialCalculations={calculationMemoryCatalog}
      />
    </div>
  );
}
