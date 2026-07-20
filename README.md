# Kynovia SaaS Core

Base reutilizável para criação de sistemas SaaS multitenant.

## Descrição do produto

O Kynovia SaaS Core é uma plataforma-base para novos sistemas SaaS. Seu objetivo é entregar uma fundação técnica segura, modular e extensível, reunindo recursos comuns como autenticação, empresas, usuários, permissões, contratos, assinaturas, módulos, auditoria e configurações.

Este repositório não representa um sistema de negócio final. Ele deve concentrar somente funcionalidades estruturais compartilháveis entre diferentes produtos.

## Objetivo

Criar uma base SaaS padronizada que possa ser reutilizada como ponto de partida para novos projetos, reduzindo retrabalho, duplicação de código e inconsistências arquiteturais.

## Escopo inicial

- Autenticação por e-mail e senha.
- Autenticação por conta Google.
- Recuperação de senha e confirmação de e-mail.
- Gerenciamento de sessão.
- Estrutura multitenant.
- Cadastro de empresas e usuários.
- Vínculo entre usuários e empresas.
- Convite, ativação e desativação de usuários.
- Controle de acesso por papéis e permissões.
- Produtos, módulos, planos, contratos e assinaturas genéricos.
- Controle de limites contratados.
- Branding configurável.
- Auditoria, notificações e configurações da plataforma.
- Painel administrativo global.
- Painel administrativo da empresa.
- Interface responsiva para desktop, tablet e dispositivos móveis.

## Princípio de separação

O Core deve conter apenas funcionalidades compartilháveis. Regras específicas de negócio, entidades de segmentos, fluxos especializados e indicadores próprios devem ser implementados fora deste repositório, nos sistemas que utilizarem o Core como base.

## Multitenancy

Cada empresa cadastrada será tratada como um tenant independente. Dados pertencentes a uma empresa deverão estár associados a um identificador obrigatório:

```text
tenant_id
```

A aplicação deverá garantir que usuários acessem somente empresas as quais estejam vinculados e que permissões sejam avaliadas no contexto da empresa ativa.

## Autenticação e autorização

A autenticação será centralizada e reutilizável, inicialmente com e-mail/senha e Google. A autorização será baseada em RBAC:

- usuários recebem papéis;
- papéis possuem permissões;
- permissões autorizam ações;
- a avaliação acontece no contexto da empresa ativa.

Exemplos de permissões:

```text
platform.users.view
platform.users.create
platform.users.update
platform.users.delete
platform.roles.manage
platform.settings.manage
platform.contracts.view
platform.contracts.manage
```

## Supabase

O Supabase será criado e configurado posteriormente em um projeto específico. Arquivos locais de ambiente e credenciais não devem ser versionados.

## Desenvolvimento local

Instale as dependências e rode o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

Aplicação local:

```text
http://localhost:3000
```

Rotas administrativas iniciais:

```text
/
/empresas
/usuarios
/acesso
/modulos
/contratos
/auth
/configuracoes
```

Fluxo inicial de empresas:

```text
/empresas
/empresas/novo
/empresas/[tenantId]
```

As telas de empresas já possuem listagem, cadastro, edição e ações de ativação/suspensão. Sem variáveis Supabase configuradas, o fluxo opera em modo mock para preservar a navegação local. Com o Supabase configurado, as mesmas server actions usam a camada `src/core/repositories`.

Fluxo inicial de usuários:

```text
/usuarios
/usuarios/novo
/usuarios/[membershipId]
```

As telas de usuários já possuem listagem de memberships, convite simulado, edição de vínculo, troca de empresa/papel e ações de ativação/suspensão. O convite real via Supabase deve ser ligado ao fluxo seguro de Auth quando o projeto Supabase dedicado existir.

Fluxo inicial de acesso/RBAC:

```text
/acesso
/acesso/novo
/acesso/[roleId]
```

As telas de acesso já possuem listagem de papéis, cadastro, edição, seleção de permissões e contagem de membros. No Supabase, o fluxo usa `roles`, `permissions`, `role_permissions` e `user_roles` respeitando as políticas RLS preparadas na migration inicial.

Fluxo inicial de contratos:

```text
/contratos
/contratos/novo
/contratos/[contractId]
```

As telas de contratos já possuem listagem, cadastro, edição, ativação e suspensão. A UI exibe plano, assinatura e limite de usuários; no Supabase, o CRUD inicial grava `contracts` e lê `plans`, `subscriptions` e `usage_limits` conforme as políticas RLS atuais.

Fluxo inicial de módulos/entitlements:

```text
/modulos
/modulos/[moduleId]
/modulos/entitlements/novo
/modulos/entitlements/[entitlementId]
```

As telas de módulos já possuem catálogo de produtos/módulos, detalhe por módulo, listagem de entitlements por tenant, cadastro, edição, ativação e suspensão. A migration inicial também prepara política RLS para gestão de entitlements por usuários com `platform.contracts.manage`.

Fluxo inicial de configurações/branding:

```text
/configuracoes
/configuracoes/branding/[tenantId]
```

As telas de configurações já possuem listagem de branding por tenant e edição de nome exibido, cores, URLs visuais, suporte, termos e privacidade. A migration inicial permite criar e atualizar `branding_settings` para usuários com `platform.settings.manage`.

Fluxo inicial de auditoria:

```text
/auditoria
/auditoria/[auditId]
```

As telas de auditoria já possuem linha do tempo de eventos, detalhe de evento, tenant, ator, entidade e metadados. A leitura usa `audit_logs`; a escrita fica preparada para uma camada segura de servidor, evitando inserts auditáveis diretamente pelo cliente.

Rotas públicas iniciais:

```text
/login
/recuperar-senha
/confirmar-email
```

Comandos de validação:

```bash
npm run lint
npm run build
```

## Design System

A interface inicial segue o Design System Kynovia v1.0:

- fundo base escuro;
- logo `Kynov<b>ia</b>`;
- azul Kynovia para ações e destaques;
- Inter para interface;
- JetBrains Mono para labels, badges, códigos e métricas;
- cards com bordas sutis e raio controlado;
- painel responsivo para desktop, tablet e mobile.

## Arquitetura inicial

O projeto já separa apresentação e domínio:

```text
src/app          rotas Next.js App Router
src/components   componentes visuais reutilizáveis
src/core/types   contratos de domínio do Core
src/core/mock-store.ts
src/core/services
```

A camada `src/core/services` expõe consultas e regras mockadas que a UI consome hoje. Quando o Supabase específico existir, essa camada será o ponto natural para trocar o mock por chamadas reais ao banco, Auth e RLS.

Contrato inicial de autorização:

```ts
checkAccess({
  tenantId,
  userId,
  productCode,
  moduleCode,
  permission,
});
```

## Supabase preparado

Arquivos iniciais para o futuro projeto Supabase:

```text
.env.example
supabase/migrations/20260715123000_initial_core_schema.sql
docs/auth-session.md
docs/supabase-integration.md
docs/supabase-schema.md
docs/supabase-rls-strategy.md
docs/pmt-integration-guide.md
docs/core-commercial-roadmap.md
```

O Supabase CLI ainda não está instalado neste ambiente, então a migration foi preparada offline e deve ser validada no projeto Supabase dedicado antes de produção.

A camada de integração já existe em `src/core/supabase` e `src/core/repositories`. Sem variáveis Supabase, o app continua usando mock automaticamente.

## Status

Repositório inicial criado para organizar a evolução do Kynovia SaaS Core. A primeira tela do app contém um painel administrativo com dados mockados para tenants, usuários, RBAC, módulos, contratos e roadmap técnico.
