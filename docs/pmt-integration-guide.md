# PMT - Guia de Desenvolvimento Acoplado ao Kynovia SaaS Core

Este documento orienta o desenvolvimento do sistema PMT para que ele seja criado como um produto acoplável ao Kynovia SaaS Core, reutilizando autenticação, tenants, usuários, RBAC, contratos, módulos, auditoria, branding e padrões visuais já existentes.

O PMT não deve duplicar funcionalidades estruturais do Core. Ele deve implementar somente regras, telas, entidades e fluxos próprios do produto PMT.

## Objetivo

Construir o PMT como um módulo/produto independente, mas compatível com o Core, permitindo que a integração futura seja simples, previsível e segura.

O desenvolvimento deve preservar estes princípios:

- usar o Core para identidade, sessão e autorização;
- isolar todos os dados por `tenant_id`;
- avaliar permissões no contexto do tenant ativo;
- controlar acesso ao produto por módulos e entitlements;
- seguir o Design System Kynovia;
- manter regras de negócio do PMT fora das camadas genéricas do Core;
- preparar banco, rotas e serviços para Supabase com RLS.

## Responsabilidades Do Core

O PMT deve reutilizar as funcionalidades abaixo, já previstas no Kynovia SaaS Core.

### Autenticação e sessão

O PMT não deve criar login próprio.

Usar:

```ts
requireSession()
requirePermission("codigo.da.permissao")
```

A sessão fornece:

- usuário autenticado;
- tenant ativo;
- lista de tenants disponíveis;
- papéis;
- permissões;
- modo de dados (`mock` ou `supabase`).

### Tenants

Toda entidade operacional do PMT deve ter:

```text
tenant_id
```

Nenhuma tela, consulta, ação ou relatório do PMT deve operar sem tenant ativo.

Decisão oficial para PMT Braidotti:

- cada tenant representa um cliente final da Braidotti;
- `tenant_id` em tabelas PMT sempre aponta para o cliente final;
- a Braidotti não concentra os dados dos clientes em um único tenant próprio;
- a Braidotti administra cada cliente por meio de usuários internos adicionados como membros do tenant do cliente;
- esses usuários recebem papéis fortes, como `Super Admin Braidotti`, `Consultor Braidotti` ou `Validador PMT`;
- usuários do cliente recebem papéis próprios e restritos, como `Admin Cliente`, `Gestor Manutenção`, `Colaborador` ou `Visualizador`.

Esse modelo garante isolamento por login, senha, usuários, branding, contratos, documentos, permissões e dados operacionais.

Não criar tabelas paralelas para administradores Braidotti. O Core já resolve isso com:

```text
tenant_memberships
roles
user_roles
permissions
```

### RBAC

O PMT deve criar permissões próprias com prefixo estável:

```text
pmt.*
```

Permissões sugeridas:

```text
pmt.dashboard.view
pmt.items.view
pmt.items.create
pmt.items.update
pmt.items.archive
pmt.reports.view
pmt.settings.manage
```

Os nomes finais devem refletir o domínio real do PMT. Evitar permissões genéricas demais, como `pmt.admin`, quando houver ações distintas.

Papéis sugeridos por tenant:

```text
Super Admin Braidotti
Consultor Braidotti
Validador PMT
Admin Cliente
Gestor Manutenção
Colaborador
Visualizador
```

A diferença entre usuário Braidotti e usuário do cliente deve ser expressa por papéis e permissões dentro do tenant, não por login paralelo, tabela paralela ou bypass de RLS.

### Produtos, módulos e entitlements

O PMT deve ser cadastrado no catálogo genérico do Core como produto:

```text
product.code = "pmt"
```

Módulos sugeridos:

```text
pmt-core
pmt-reports
pmt-admin
```

O acesso funcional deve considerar:

- usuário autenticado;
- tenant ativo;
- permissão RBAC;
- entitlement ativo para o produto/módulo PMT.

### Auditoria

Ações sensíveis do PMT devem gerar eventos de auditoria, como:

```text
pmt.item.created
pmt.item.updated
pmt.item.archived
pmt.settings.updated
```

Os logs devem incluir:

- `tenant_id`;
- usuário ator;
- tipo da entidade;
- id da entidade;
- metadados mínimos para rastreabilidade.

Não inserir auditoria diretamente pelo client. A escrita deve passar por camada server-side segura.

### Branding

O PMT deve respeitar branding do tenant quando aplicável:

- nome exibido;
- logo;
- cores;
- canais de suporte;
- URLs de termos e privacidade.

Não criar configuração visual paralela se o Core já fornecer o dado.

## Responsabilidades Do PMT

O PMT deve conter apenas funcionalidades específicas do seu domínio.

Exemplos de responsabilidades do PMT:

- telas operacionais próprias;
- entidades de negócio próprias;
- workflows específicos;
- indicadores específicos;
- relatórios específicos;
- configurações específicas do produto;
- integrações externas próprias, quando existirem.

O PMT não deve conter:

- cadastro estrutural de empresas;
- login;
- recuperação de senha;
- convite global de usuários;
- tabela própria de permissões globais;
- tabela própria de papéis;
- lógica comercial genérica de contratos e assinaturas;
- chave `service_role` no client;
- autorização baseada em `user_metadata`.

## Estrutura Recomendada

Se o PMT for desenvolvido dentro deste repositório, usar uma estrutura isolada:

```text
src/app/(admin)/pmt
src/features/pmt/actions
src/features/pmt/components
src/features/pmt/repositories
src/features/pmt/services
src/features/pmt/types.ts
src/features/pmt/validation.ts
```

Se o PMT for desenvolvido em outro repositório, manter a mesma separação lógica e criar uma camada de adaptação para consumir os contratos do Core.

## Rotas Sugeridas

As rotas devem ficar atrás do layout administrativo do Core:

```text
/pmt
/pmt/novo
/pmt/[itemId]
/pmt/relatorios
/pmt/configuracoes
```

Cada rota deve:

- chamar `requireSession()` quando renderizar dados sensíveis;
- chamar `requirePermission()` para ações e telas restritas;
- usar o tenant ativo da sessão;
- não aceitar `tenantId` arbitrário do client sem validar vínculo/permissão.

## Banco De Dados

Todas as tabelas operacionais do PMT devem seguir o padrão:

```sql
create table public.pmt_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  status text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Regras obrigatórias:

- `tenant_id` representa o cliente final da Braidotti;
- toda tabela de negócio deve ter RLS habilitado;
- políticas devem usar `TO authenticated` e predicados explícitos;
- `UPDATE` deve ter `USING` e `WITH CHECK`;
- dados do tenant devem ser filtrados por `tenant_id`;
- permissões devem usar códigos `pmt.*`;
- inserts/updates sensíveis devem ser feitos por Server Actions ou Route Handlers seguros;
- não usar `service_role` em componentes client.

## Server Actions

Toda ação de escrita do PMT deve seguir este formato:

```ts
"use server";

import { requirePermission } from "@/core/auth/session";

export async function createPmtItemAction(formData: FormData) {
  const session = await requirePermission("pmt.items.create");
  const input = parseAndValidateForm(formData);

  return createPmtItem({
    ...input,
    tenantId: session.activeTenant.id,
    actorUserId: session.user.id,
  });
}
```

Regras:

- validar dados no servidor;
- aplicar limite de tamanho em textos;
- validar e-mails, datas, URLs e enums;
- nunca confiar apenas em campos ocultos do formulário;
- registrar auditoria em ações sensíveis;
- retornar erros controlados quando possível.

## Interface

O PMT deve seguir o Design System Kynovia:

- fundo escuro;
- cards discretos e com raio controlado;
- azul Kynovia para ações principais;
- Inter para interface;
- JetBrains Mono para labels, códigos e métricas;
- tabelas densas para listagens operacionais;
- botões com ícones Lucide quando houver ícone adequado;
- responsividade para desktop, tablet e mobile.

Não criar uma landing page interna para o PMT. A primeira tela deve ser a experiência operacional real.

## Checklist Para O Codex Antes De Desenvolver O PMT

1. Ler `README.md`.
2. Ler `docs/auth-session.md`.
3. Ler `docs/supabase-schema.md`.
4. Ler `docs/supabase-rls-strategy.md`.
5. Ler `docs/core-commercial-roadmap.md`.
6. Ler o Design System Kynovia.
7. Confirmar quais entidades e fluxos pertencem ao PMT.
8. Definir permissões `pmt.*`.
9. Definir módulos/entitlements do produto `pmt`.
10. Criar rotas, componentes, services e repositories isolados em `src/features/pmt`.
11. Criar migration Supabase do PMT com `tenant_id` e RLS.
12. Rodar `npm run lint`.
13. Rodar `npm run build`.

## Critérios De Aceite

O PMT estará corretamente preparado para acoplamento quando:

- nenhuma funcionalidade estrutural do Core tiver sido duplicada;
- todas as entidades do PMT estiverem isoladas por `tenant_id` do cliente final;
- usuários Braidotti administrarem clientes por membership, roles e permissions do Core;
- todas as ações de escrita exigirem permissão explícita;
- as permissões `pmt.*` estiverem documentadas e sem conflito com `platform.*`;
- as telas usarem o layout e o Design System do Core;
- o acesso ao PMT puder ser ligado/desligado por entitlement;
- as migrations tiverem RLS;
- nenhum segredo estiver exposto no client;
- `npm run lint` e `npm run build` passarem.

## Prompt Base Para Desenvolvimento Futuro

Use este prompt quando for pedir ao Codex para iniciar o PMT:

```text
Desenvolva o sistema PMT como produto acoplável ao Kynovia SaaS Core.
Antes de codar, leia README.md, docs/auth-session.md, docs/supabase-schema.md,
docs/supabase-rls-strategy.md, docs/core-commercial-roadmap.md e
docs/pmt-integration-guide.md.

Não duplique autenticação, tenants, usuários, papéis, permissões, contratos,
assinaturas, branding ou auditoria. Reutilize requireSession(),
requirePermission(), tenant ativo, RBAC, entitlements e padrões visuais do Core.

Decisão arquitetural obrigatória: cada tenant representa um cliente final da
Braidotti. A Braidotti atua como Super Admin dos tenants dos clientes usando
membership, roles, user_roles e permissions do Core. Não crie login, tabela ou
bypass paralelo para administradores Braidotti.

Crie as funcionalidades do PMT em estrutura isolada, preferencialmente em
src/features/pmt e rotas /pmt. Toda entidade operacional deve ter tenant_id.
Toda ação de escrita deve validar dados no servidor e exigir permissão pmt.*.
Prepare migrations com RLS e rode npm run lint e npm run build.
```
