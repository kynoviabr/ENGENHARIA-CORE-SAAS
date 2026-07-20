# Revisão da Estrutura de Banco - PMT Braidotti

Data da revisão: 2026-07-19

## Veredito

A estrutura proposta está conceitualmente alinhada ao Kynovia SaaS Core e pode evoluir para migration, desde que alguns pontos sejam ajustados antes da aplicação no Supabase.

O desenho não duplica autenticação, tenants, contratos, produtos, permissões ou papéis do Core. As tabelas propostas pertencem majoritariamente ao domínio operacional do PMT, o que está correto.

Os pontos que exigem atenção antes da migration são:

- aplicação consistente da decisão de `tenant_id`;
- estratégia de RLS para permissões `pmt.*`;
- vínculo comercial com `contract_scopes`;
- storage de documentos;
- privacidade de custo/hora;
- normalização parcial de hierarquia e papéis de projeto.

## Respostas Aos Pontos De Validação

### 1. `public.tenants` e `public.profiles`

Estão corretos.

O Core usa:

```text
public.tenants
public.profiles
```

Não criar `public.users`. Usuários autenticados continuam em `auth.users`, com dados de aplicação em `public.profiles`.

### 2. Função para RLS

A função existente é:

```sql
core_private.has_platform_permission(target_tenant_id uuid, permission_code text)
```

Ela funciona para validar qualquer código cadastrado em `public.permissions`, inclusive `pmt.*`, apesar do nome mencionar `platform`.

Recomendação:

- curto prazo: usar `core_private.has_platform_permission(tenant_id, 'pmt.alguma.permissao')`;
- médio prazo: criar um alias mais genérico, como `core_private.has_permission(target_tenant_id uuid, permission_code text)`, para evitar confusão semântica nas migrations do PMT.

### 3. Vínculo com contrato/escopo

Usar:

```text
core_contract_scope_id uuid references public.contract_scopes(id)
```

Também manter:

```text
core_resource_type
core_resource_id
```

Motivo: `contract_scopes` é a fonte comercial do Core para dizer que um recurso externo está coberto por contrato. Já `core_resource_type` e `core_resource_id` permitem resolver o vínculo com estabilidade mesmo quando a tela ou integração precisar consultar por identificador externo.

Regra recomendada:

- `core_resource_type = 'pmt_project'` ou `'project'`;
- `core_resource_id = pmt_projects.id::text` ou um identificador externo estável;
- `core_contract_scope_id` deve ser obrigatório apenas quando o projeto já estiver comercialmente contratado.

### 4. Documentos e Storage

Usar Supabase Storage com bucket do PMT, por exemplo:

```text
pmt-documents
```

O Core não precisa centralizar os arquivos físicos. O Core deve centralizar identidade, permissões, auditoria e governança.

Recomendação de path:

```text
tenant/{tenant_id}/project/{project_id}/{document_id}/{filename}
```

A tabela `pmt_project_documents` deve guardar metadados e referência do arquivo. A leitura/escrita no bucket deve respeitar RLS/policies equivalentes às permissões PMT.

### 5. Funcionário operacional e usuário Core

O campo opcional está correto:

```text
pmt_employees.user_id references public.profiles(id)
```

Funcionário operacional não precisa nascer como usuário autenticado.

Regras:

- se ele apenas aparece em apontamentos, fica só em `pmt_employees`;
- se ele acessará o sistema, o convite deve nascer pelo Core e depois vincular `pmt_employees.user_id`;
- nunca criar login paralelo no PMT.

### 6. Permissões PMT

Devem ficar no catálogo central:

```text
public.permissions
```

Não criar catálogo próprio de permissões PMT. Usar prefixo:

```text
pmt.*
```

Permissões iniciais sugeridas:

```text
pmt.projects.view
pmt.projects.manage
pmt.employees.view
pmt.employees.manage
pmt.reports.view
pmt.reports.create
pmt.reports.validate
pmt.observations.create
pmt.calculations.view
pmt.calculations.approve
pmt.action_items.manage
pmt.documents.view
pmt.documents.manage
pmt.costs.view
pmt.settings.manage
```

### 7. Significado de `tenant_id`

Este é o ponto mais crítico.

`tenant_id` não deve representar Braidotti em uma tabela e cliente em outra. Ele precisa ter um significado único dentro do PMT.

Decisão oficial para o PMT Braidotti:

- cada tenant representa um cliente final da Braidotti;
- todos os dados operacionais PMT usam `tenant_id` do cliente final;
- cada cliente terá isolamento de login, senha, usuários, branding, contratos, permissões, documentos e dados operacionais;
- a Braidotti será Super Admin operacional/comercial dentro dos tenants dos clientes;
- usuários internos da Braidotti devem entrar nos tenants dos clientes por `tenant_memberships`, `roles` e `user_roles`;
- não criar uma tabela paralela como `braidotti_admins` para burlar o RBAC do Core.

Exemplo:

```text
Tenant: Cliente A
Usuário: consultor@braidotti.com
Papel: Super Admin Braidotti
Permissões: pmt.*, platform.users.update, platform.contracts.view

Tenant: Cliente A
Usuário: gerente@clientea.com
Papel: Admin Cliente
Permissões: pmt.projects.view, pmt.reports.view, pmt.documents.view
```

A Braidotti pode ter um tenant próprio apenas para uso interno, gestão própria ou demonstrações. Esse tenant não deve concentrar dados operacionais dos clientes finais.

### 8. `pmt_project_memberships`

A tabela é necessária.

O Core resolve:

- usuário autenticado;
- vínculo com tenant;
- permissões;
- acesso ao produto/módulo;
- contrato/escopo comercial.

O PMT ainda precisa resolver acesso operacional por projeto:

- consultor do projeto;
- observador;
- validador;
- gestor;
- acesso temporário;
- participação encerrada.

Portanto `pmt_project_memberships` está correta.

### 9. `pmt_project_activities`

A tabela própria é recomendada.

Ela deve funcionar como snapshot/customização por projeto derivada de `pmt_activity_codes`.

Motivo: metodologias e catálogos podem evoluir, mas um projeto em andamento ou já calculado precisa preservar os códigos usados na época.

Recomendação:

- manter `source_activity_code` apontando para o catálogo metodológico;
- copiar `code`, `name`, `category` para o projeto;
- não depender de join com catálogo global para reprocessar cálculo histórico.

### 10. `project_hierarchy` e `project_roles` em JSONB

Aceitável para configuração flexível e pouco consultada, mas não para controle de acesso sensível.

Recomendação:

- `project_hierarchy` pode ficar em JSONB se for apenas estrutura de exibição/configuração;
- `project_roles` em JSONB pode existir como configuração, mas vínculos reais de usuário devem ficar em `pmt_project_memberships`;
- se hierarquia for usada em filtros, relatórios frequentes ou permissões, criar tabelas normalizadas.

### 11. `pmt_employees`

Deve ficar no PMT.

Funcionário operacional de manutenção é entidade de domínio do PMT, não do Core. O Core não deve virar cadastro compartilhado de colaboradores operacionais.

Manter no Core apenas usuários autenticados e perfis de aplicação.

### 12. `hourly_cost`

Pode ficar no PMT, mas é dado sensível.

Recomendações obrigatórias:

- criar permissão específica `pmt.costs.view`;
- não expor `hourly_cost` em listagens gerais;
- considerar separar custo em tabela própria, como `pmt_employee_costs`, se houver muitos perfis sem acesso a custo;
- auditar leituras/exportações sensíveis quando possível;
- nunca enviar custo para componentes client sem necessidade.

### 13. `calculation_runs` com snapshot JSONB

Está correto e é recomendado.

Para auditoria e reprodutibilidade, `pmt_calculation_runs.inputs` deve armazenar o snapshot completo dos parâmetros usados no cálculo.

Também manter colunas materializadas para os principais indicadores:

```text
total_seconds
productive_seconds
a_percent
travel_percent
fatigue_percent
fp_percent
coverage_percent
validated_report_count
entry_count
```

Recomendação adicional:

- `snapshot_hash` deve ser único por `tenant_id`, `project_id` e conteúdo do snapshot;
- calculation run publicado não deve ser editado; criar novo run e marcar anterior como `superseded`.

### 14. Alinhamento geral

O modelo está alinhado com multi-tenant, RLS, auditoria, permissões e integração futura com contratos do Core, com ajustes.

Não aplicar migrations antes de garantir:

1. `tenant_id` sempre representa o cliente final;
2. função RLS genérica ou uso documentado de `has_platform_permission` para `pmt.*`;
3. regras de acesso a custo;
4. estratégia de storage;
5. FK opcional para `public.contract_scopes`.

## Avaliação Das Tabelas

| Tabela | Avaliação | Ajuste recomendado |
| --- | --- | --- |
| `pmt_methodology_versions` | Aprovada | Definir se metodologia é global ou por tenant. |
| `pmt_activity_codes` | Aprovada | Adicionar unicidade por metodologia e código. |
| `pmt_validation_rules` | Aprovada | Vincular à metodologia ou projeto se regras variarem por estudo. |
| `pmt_projects` | Aprovada com atenção | Decidir `tenant_id` e FK para `contract_scopes`. |
| `pmt_project_memberships` | Aprovada | Usar para acesso por projeto. |
| `pmt_employees` | Aprovada | `user_id` opcional está correto. Proteger custo/hora. |
| `pmt_project_employee_assignments` | Aprovada | Boa separação entre funcionário e projeto. |
| `pmt_project_activities` | Aprovada | Usar como snapshot por projeto. |
| `pmt_daily_reports` | Aprovada | Validar unicidade por projeto, funcionário, data e turno. |
| `pmt_daily_report_entries` | Aprovada | Validar duração, ordem e soma do diário. |
| `pmt_daily_report_reclassifications` | Aprovada | Não permitir update/delete comum. |
| `pmt_observations` | Aprovada | `client_uuid` deve ser renomeado se não for UUID real do Core. |
| `pmt_calculation_runs` | Aprovada | Snapshot JSONB é recomendado. |
| `pmt_action_items` | Aprovada | Considerar owner_user_id opcional no futuro. |
| `pmt_project_documents` | Aprovada | Usar Storage PMT com metadados em tabela. |

## Recomendações Para A Migration PMT

### Convenções

- Todas as tabelas devem ter `tenant_id`.
- Todas as tabelas devem ter RLS habilitado.
- Todas as policies devem usar `TO authenticated`.
- `UPDATE` deve ter `USING` e `WITH CHECK`.
- Toda tabela principal deve ter `created_at` e `updated_at`.
- Ações sensíveis devem ter `created_by`, `updated_by` ou histórico específico.
- Não usar `service_role` no client.

### Índices mínimos

Criar índices por:

```text
tenant_id
project_id
status
report_date
employee_id
methodology_version_id
core_contract_scope_id
```

Em tabelas grandes, especialmente apontamentos e observações:

```text
(tenant_id, project_id, report_date)
(tenant_id, project_id, employee_id)
(tenant_id, daily_report_id)
```

### Checks recomendados

- `duration_seconds >= 0`;
- `total_reported_seconds >= 0`;
- percentuais entre `0` e `100`, salvo regra metodológica contrária;
- `period_end >= period_start`;
- `ends_at >= starts_at`;
- `hourly_cost >= 0`;
- status restritos por enum ou check constraint.

### RLS conceitual

Exemplo de leitura de projeto:

```sql
using (
  core_private.has_platform_permission(tenant_id, 'pmt.projects.view')
  or exists (
    select 1
    from public.pmt_project_memberships ppm
    where ppm.tenant_id = pmt_projects.tenant_id
      and ppm.project_id = pmt_projects.id
      and ppm.user_id = auth.uid()
      and ppm.status = 'active'
  )
)
```

Se `pmt_project_memberships.user_id` referenciar `public.profiles(id)`, confirmar se `profiles.id` é igual a `auth.uid()`. No Core atual, é.

## Decisão Oficial Antes De Prosseguir

Para a primeira versão PMT Braidotti, a decisão oficial é:

```text
tenant_id = cliente final da Braidotti
Braidotti = Super Admin por membership, roles e permissions dentro de cada tenant
```

Isso garante isolamento real por cliente:

- login e senha separados;
- usuários separados;
- branding por cliente;
- contratos e entitlements por cliente;
- documentos e dados PMT isolados por RLS;
- administração da Braidotti sem duplicar autenticação ou papéis fora do Core.

Usuários Braidotti que precisarem administrar ou operar PMT devem ser membros dos tenants dos clientes, com papéis fortes e auditáveis.

## Conclusão

A proposta pode seguir para desenho de migration depois dos ajustes acima. Ela melhora o produto e não quebra as regras do Kynovia SaaS Core.

O principal risco arquitetural era a definição de `tenant_id`. Com a decisão de que cada tenant é um cliente final, a modelagem fica coerente com o Core e preparada para Supabase, RLS, auditoria, branding por cliente e acoplamento comercial.
