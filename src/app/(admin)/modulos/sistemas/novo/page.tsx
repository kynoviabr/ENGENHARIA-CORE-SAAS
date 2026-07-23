import { createProductAction } from "@/core/actions/catalog-actions";
import { DataPanel } from "@/components/data-panel";
import { PageHeader } from "@/components/page-header";
import { ProductForm } from "@/components/product-form";

export default async function NovoSistemaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="// Sistemas"
        title="Novo sistema"
        description="Cadastre um produto acoplável ao Core. Depois, cadastre módulos e libere o acesso por cliente via entitlements."
      />

      <DataPanel eyebrow="// Sistema" title="Dados do sistema">
        <div className="p-5">
          <ProductForm action={createProductAction} submitLabel="Criar sistema" />
        </div>
      </DataPanel>
    </div>
  );
}
