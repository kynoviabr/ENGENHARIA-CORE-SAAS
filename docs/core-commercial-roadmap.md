# Kynovia SaaS Core - Roadmap Comercial e de Acoplamento

Este documento consolida as regras de evolução do Kynovia SaaS Core para contratos, licenciamento, produtos, módulos, recursos externos e aplicações consumidoras.

Ele substitui interpretações literais de documentos de ajuste quando houver risco de duplicar entidades já existentes no Core. O objetivo é manter o Core genérico, seguro e reutilizável.

## Decisão Arquitetural

O Core será a camada central de:

- autenticação;
- sessão;
- multitenancy;
- usuários e vínculos com tenants;
- RBAC;
- produtos e módulos genéricos;
- contratos;
- assinaturas;
- entitlements;
- limites;
- escopos comerciais;
- branding;
- auditoria;
- isolamento de dados por tenant.

O Core não será responsável por entidades operacionais de produtos consumidores, como projetos, atividades, equipes, funcionários, diários, apontamentos, manutenção, produtividade ou indicadores específicos.

## Regras Que Não Devem Ser Quebradas

1. Não criar um cadastro operacional completo de recursos externos dentro do Core.
2. Não criar `project_id` obrigatório em `contracts`.
3. Não criar tabela `public.users` paralela ao Supabase Auth.
4. Não criar fontes duplicadas de liberação de produto/módulo.
5. Não usar nome de papel como autorização final.
6. Não usar `user_metadata` para autorização.
7. Não expor `service_role` no client.
8. Não armazenar segredos em arquivos versionados.
9. Não criar permissões genéricas demais quando a ação precisa ser auditável.
10. Não remover funcionalidades existentes sem migration e avaliação de compatibilidade.

## Identidade e Usuários

O modelo oficial permanece:

```text
auth.users
profiles
tenant_memberships
user_roles
roles
permissions
role_permissions
```

`auth.users` pertence ao Supabase Auth. `profiles` guarda dados de aplicação. `tenant_memberships` define em quais tenants o usuário pode operar.

Não criar `public.users` para identidade global, pois isso duplicaria o Supabase Auth e aumentaria risco de inconsistência.

## Permissões

Permissões do Core devem usar prefixo:

```text
platform.*
```

Permissões de produtos consumidores devem usar prefixo próprio:

```text
pmt.*
app.*
```

Preferir permissões granulares:

```text
platform.users.view
platform.users.create
platform.users.update
platform.users.delete
platform.tenants.manage
platform.roles.manage
platform.contracts.view
platform.contracts.manage
platform.subscriptions.manage
platform.entitlements.manage
```

Evitar trocar permissões granulares por permissões amplas como `platform.users.manage`, a menos que exista uma necessidade operacional clara.

## Produtos, Módulos e Liberação Por Tenant

O catálogo estrutural permanece:

```text
products
modules
entitlements
```

`entitlements` deve ser a fonte canônica para responder:

- qual tenant possui acesso;
- qual produto está habilitado;
- qual módulo está habilitado;
- se a liberação é global ou por recurso;
- qual é a origem da liberação;
- qual é o período de validade;
- qual é o status atual.

Não criar `tenant_products` e `tenant_modules` como novas fontes de verdade se `entitlements` já cobre o cenário. Se forem úteis para leitura, devem ser views ou consultas derivadas de `entitlements`.

## Contratos

`contracts` representa a relação comercial com o tenant. A evolução deve continuar incremental.

Campos comerciais atuais:

```text
contract_number
billing_cycle
```

Regras:

- um tenant pode ter vários contratos;
- um contrato pode contemplar produtos, módulos, usuários, serviços ou recursos externos;
- um contrato pode existir sem recurso externo associado;
- o Core não deve assumir que todo contrato está ligado a projeto;
- modelos de cobrança devem continuar flexíveis.

## Itens Contratuais

`contract_items` detalha o que foi contratado em cada contrato.

Estrutura conceitual:

```text
id
tenant_id
contract_id
product_id
module_id
item_type
description
billing_model
quantity
unit_price
total_price
starts_at
ends_at
status
metadata
created_at
updated_at
```

Modelos iniciais:

```text
flat
per_user
per_resource
per_unit
usage_based
custom
```

`tenant_id` deve existir também em `contract_items` para facilitar RLS, índices e auditoria, mesmo que o contrato já tenha `tenant_id`.

## Escopos Contratuais

`contract_scopes` relaciona contratos ou itens contratuais a recursos externos sem transformar o Core no dono operacional desses recursos.

Estrutura conceitual:

```text
id
tenant_id
contract_id
contract_item_id
product_id
resource_type
resource_id
resource_code
display_name
status
starts_at
expires_at
metadata
created_at
updated_at
```

Regras:

- `resource_type` identifica o tipo genérico do recurso, como `project`, `unit`, `branch`, `workspace` ou `operation`;
- `resource_id` é um identificador externo estável;
- `resource_code` e `display_name` são referências comerciais para leitura humana;
- o Core armazena a referência comercial, não a entidade operacional completa;
- `metadata` é complementar e não deve virar depósito de dados estruturantes.

## Recursos Externos

Quando for necessário registrar recursos externos no Core, usar a tabela genérica `external_resources`.

Ela deve ser apenas um índice de referência:

```text
id
tenant_id
product_id
resource_type
external_id
code
display_name
status
metadata
created_at
updated_at
```

O Core pode validar que um recurso está registrado para o tenant, mas não deve consultar diretamente tabelas operacionais do produto consumidor.

Formas permitidas de validação:

- registro prévio em `external_resources`;
- endpoint interno do produto consumidor;
- função de integração server-side;
- evento assinado vindo do produto consumidor.

## Entitlements Por Recurso

`entitlements` permite liberação global, por módulo ou por recurso externo.

Campos de recurso:

```text
resource_type
resource_id
source_id
metadata
```

`source` deve continuar indicando a origem:

```text
plan
contract
subscription
trial
manual
core
```

`source_id` deve apontar para a origem quando aplicável, como `contract_id`, `contract_item_id` ou `subscription_id`.

## CheckAccess

O serviço central deve evoluir para uma resposta explicativa.

Interface conceitual:

```ts
checkAccess({
  tenantId,
  userId,
  productCode,
  moduleCode,
  permission,
  resourceType,
  resourceId,
});
```

Resposta:

```ts
type AccessCheckResult = {
  allowed: boolean;
  reason:
    | null
    | "unauthenticated"
    | "tenant_inactive"
    | "membership_inactive"
    | "permission_denied"
    | "product_not_enabled"
    | "module_not_enabled"
    | "contract_inactive"
    | "subscription_inactive"
    | "entitlement_missing"
    | "resource_not_covered"
    | "limit_exceeded";
};
```

A validação deve considerar, quando aplicável:

- usuário autenticado;
- vínculo ativo com tenant;
- tenant ativo;
- produto habilitado;
- módulo habilitado;
- permissão;
- contrato vigente;
- assinatura vigente;
- entitlement ativo;
- recurso coberto por contrato ou entitlement;
- limites contratados.

## Branding e Domínios

O modelo oficial atual é:

```text
branding_settings
```

Não criar tabela `brandings` paralela sem necessidade. Evoluir `branding_settings` e adicionar uma tabela separada de domínios quando necessário:

```text
branding_domains
```

Regras:

- branding visual não pode alterar regras de autenticação ou autorização;
- URLs de logo, favicon, login, termos e privacidade devem ser validadas;
- domínios devem ser únicos e associados a tenant ou configuração global;
- autenticação e callbacks devem ser configurados com segurança antes de produção.

## Auditoria

Auditoria deve registrar ações estruturais e comerciais relevantes:

- login;
- logout;
- tentativa de acesso negada;
- alteração de tenant;
- convite ou alteração de usuário;
- alteração de papel ou permissão;
- criação ou alteração de contrato;
- criação ou alteração de item contratual;
- associação de escopo contratual;
- alteração de assinatura;
- criação ou revogação de entitlement;
- alteração de branding ou domínio.

Campos futuros podem incluir:

```text
old_data
new_data
ip_address
user_agent
```

Antes de armazenar `old_data` e `new_data`, implementar mascaramento de dados sensíveis, política de retenção e limite de tamanho.

## Supabase e RLS

Toda migration futura deve seguir estas regras:

- habilitar RLS em tabelas expostas;
- usar `TO authenticated` com predicado explícito;
- criar `USING` e `WITH CHECK` em políticas de update;
- evitar `SECURITY DEFINER` salvo quando for estritamente necessário;
- manter funções privilegiadas fora do schema `public`;
- revogar execução pública de funções internas;
- validar RLS com usuários de tenants diferentes;
- rodar advisors do Supabase antes de produção;
- não depender de `tenant_id` vindo do frontend.

## Ordem Recomendada De Implementação

1. Documentar decisões e contratos de dados.
2. Manter migrations incrementais para alterações futuras em contratos, itens e escopos.
3. Evoluir telas administrativas globais para criação completa de itens, escopos e entitlements.
4. Criar visão de tenant somente leitura para contratos, limites e recursos cobertos.
5. Conectar produtos consumidores usando `external_resources`, `contract_scopes` e entitlements por recurso.
6. Ampliar `checkAccess` com limites quantitativos quando houver cobrança por uso.
7. Adicionar auditoria de escrita.
8. Criar testes de RLS, autorização e isolamento multitenant.

## Critérios De Aceite

A evolução estará correta quando:

- o Core continuar sem entidades operacionais específicas;
- `auth.users` e `profiles` continuarem como modelo oficial de identidade;
- `entitlements` for a fonte canônica de liberação;
- contratos puderem cobrir usuários, módulos, serviços ou recursos externos;
- recursos externos forem apenas referências comerciais;
- `checkAccess` explicar o motivo de negação;
- RLS proteger todas as tabelas novas;
- permissões forem validadas no backend e no banco;
- auditoria registrar ações críticas sem expor dados sensíveis;
- `npm run lint` e `npm run build` passarem após implementação.
