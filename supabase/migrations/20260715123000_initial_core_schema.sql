-- Kynovia SaaS Core - initial Supabase schema
-- Prepared offline. Validate with Supabase CLI/advisors before applying to production.

create extension if not exists pgcrypto;

create type public.tenant_status as enum ('pending', 'active', 'suspended', 'cancelled');
create type public.membership_status as enum ('invited', 'active', 'suspended', 'removed');
create type public.role_scope as enum ('global', 'tenant');
create type public.catalog_status as enum ('active', 'pending', 'planned', 'suspended');
create type public.billing_cycle as enum ('monthly', 'quarterly', 'yearly', 'trial');
create type public.billing_model as enum ('flat', 'per_user', 'per_resource', 'per_unit', 'usage_based', 'custom');
create type public.contract_status as enum ('draft', 'pending', 'active', 'expired', 'suspended', 'cancelled', 'closed');
create type public.subscription_status as enum ('trial', 'active', 'pending', 'past_due', 'suspended', 'cancelled', 'expired');
create type public.entitlement_source as enum ('plan', 'contract', 'subscription', 'trial', 'manual', 'core');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  status membership_status not null default 'active',
  last_access_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  trade_name text not null,
  document text not null unique,
  email text not null,
  phone text,
  status tenant_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status membership_status not null default 'invited',
  invited_by uuid references public.profiles(id) on delete set null,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  name text not null,
  scope role_scope not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roles_scope_tenant_check check (
    (scope = 'global' and tenant_id is null)
    or (scope = 'tenant')
  ),
  unique (tenant_id, name)
);

create table public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id, role_id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  status catalog_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  status catalog_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, code)
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  billing_cycle billing_cycle not null,
  status catalog_status not null default 'active',
  maximum_users integer not null default 0 check (maximum_users >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  contract_number text not null,
  billing_cycle billing_cycle not null default 'monthly',
  start_date date not null,
  end_date date,
  renewal_date date,
  status contract_status not null default 'draft',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contract_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  module_id uuid references public.modules(id) on delete set null,
  item_type text not null,
  description text not null,
  billing_model billing_model not null,
  quantity numeric(12, 2) not null default 1 check (quantity >= 0),
  unit_price numeric(12, 2) not null default 0 check (unit_price >= 0),
  total_price numeric(12, 2) not null default 0 check (total_price >= 0),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  status catalog_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.external_resources (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  resource_type text not null,
  external_id text not null,
  code text not null,
  display_name text,
  status catalog_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, resource_type, external_id)
);

create table public.contract_scopes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  contract_item_id uuid references public.contract_items(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  resource_type text not null,
  resource_id text not null,
  resource_code text not null,
  display_name text,
  status catalog_status not null default 'active',
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status subscription_status not null default 'pending',
  started_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  module_id uuid references public.modules(id) on delete cascade,
  resource_type text,
  resource_id text,
  status catalog_status not null default 'active',
  source entitlement_source not null,
  source_id uuid,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.usage_limits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  code text not null,
  limit_value integer not null check (limit_value >= 0),
  used_value integer not null default 0 check (used_value >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, code)
);

create table public.branding_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references public.tenants(id) on delete cascade,
  name text not null,
  logo_url text,
  small_logo_url text,
  favicon_url text,
  primary_color text not null default '#2563EB',
  secondary_color text not null default '#3B82F6',
  login_image_url text,
  support_email text,
  support_phone text,
  terms_url text,
  privacy_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete set null,
  actor_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index tenant_memberships_user_id_idx on public.tenant_memberships (user_id);
create index tenant_memberships_tenant_status_idx on public.tenant_memberships (tenant_id, status);
create index roles_tenant_id_idx on public.roles (tenant_id);
create unique index roles_global_name_unique on public.roles (name) where tenant_id is null;
create unique index roles_tenant_name_unique on public.roles (tenant_id, name) where tenant_id is not null;
create index role_permissions_permission_id_idx on public.role_permissions (permission_id);
create index user_roles_user_tenant_idx on public.user_roles (user_id, tenant_id);
create index modules_product_id_idx on public.modules (product_id);
create index contracts_tenant_status_idx on public.contracts (tenant_id, status);
create unique index contracts_tenant_number_unique on public.contracts (tenant_id, contract_number);
create index contract_items_contract_status_idx on public.contract_items (contract_id, status);
create index contract_items_tenant_status_idx on public.contract_items (tenant_id, status);
create index external_resources_tenant_resource_idx on public.external_resources (tenant_id, resource_type, external_id);
create index contract_scopes_tenant_resource_idx on public.contract_scopes (tenant_id, resource_type, resource_id, status);
create index contract_scopes_contract_status_idx on public.contract_scopes (contract_id, status);
create index subscriptions_tenant_status_idx on public.subscriptions (tenant_id, status);
create index entitlements_tenant_module_idx on public.entitlements (tenant_id, module_id, status);
create index entitlements_tenant_resource_idx on public.entitlements (tenant_id, resource_type, resource_id, status);
create unique index entitlements_tenant_product_module_global_unique
  on public.entitlements (tenant_id, product_id, coalesce(module_id, '00000000-0000-0000-0000-000000000000'::uuid))
  where resource_type is null and resource_id is null;
create unique index entitlements_tenant_product_module_resource_unique
  on public.entitlements (
    tenant_id,
    product_id,
    coalesce(module_id, '00000000-0000-0000-0000-000000000000'::uuid),
    resource_type,
    resource_id
  )
  where resource_type is not null and resource_id is not null;
create index usage_limits_tenant_code_idx on public.usage_limits (tenant_id, code);
create index audit_logs_tenant_created_at_idx on public.audit_logs (tenant_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.permissions enable row level security;
alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.products enable row level security;
alter table public.modules enable row level security;
alter table public.plans enable row level security;
alter table public.contracts enable row level security;
alter table public.contract_items enable row level security;
alter table public.external_resources enable row level security;
alter table public.contract_scopes enable row level security;
alter table public.subscriptions enable row level security;
alter table public.entitlements enable row level security;
alter table public.usage_limits enable row level security;
alter table public.branding_settings enable row level security;
alter table public.audit_logs enable row level security;

create schema if not exists core_private;
revoke all on schema core_private from public;
grant usage on schema core_private to authenticated;

create or replace function core_private.is_active_tenant_member(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    join public.tenants t on t.id = tm.tenant_id
    where tm.tenant_id = target_tenant_id
      and tm.user_id = (select auth.uid())
      and tm.status = 'active'
      and t.status = 'active'
  );
$$;

create or replace function core_private.has_platform_permission(target_tenant_id uuid, permission_code text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    where ur.tenant_id = target_tenant_id
      and ur.user_id = (select auth.uid())
      and p.code = permission_code
      and core_private.is_active_tenant_member(target_tenant_id)
  );
$$;

revoke all on function core_private.is_active_tenant_member(uuid) from public;
revoke all on function core_private.has_platform_permission(uuid, text) from public;
grant execute on function core_private.is_active_tenant_member(uuid) to authenticated;
grant execute on function core_private.has_platform_permission(uuid, text) to authenticated;

create policy "Users can view their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can view tenants where they are active members"
on public.tenants for select
to authenticated
using (core_private.is_active_tenant_member(id));

create policy "Tenant managers can update tenant records"
on public.tenants for update
to authenticated
using (core_private.has_platform_permission(id, 'platform.tenants.manage'))
with check (core_private.has_platform_permission(id, 'platform.tenants.manage'));

create policy "Users can view memberships in active tenants"
on public.tenant_memberships for select
to authenticated
using (core_private.is_active_tenant_member(tenant_id));

create policy "Tenant admins can manage memberships"
on public.tenant_memberships for all
to authenticated
using (core_private.has_platform_permission(tenant_id, 'platform.users.update'))
with check (core_private.has_platform_permission(tenant_id, 'platform.users.update'));

create policy "Active members can view permissions"
on public.permissions for select
to authenticated
using (exists (
  select 1
  from public.tenant_memberships tm
  where tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

create policy "Active members can view roles for their tenants"
on public.roles for select
to authenticated
using (tenant_id is null or core_private.is_active_tenant_member(tenant_id));

create policy "Role managers can manage tenant roles"
on public.roles for all
to authenticated
using (tenant_id is not null and core_private.has_platform_permission(tenant_id, 'platform.roles.manage'))
with check (tenant_id is not null and core_private.has_platform_permission(tenant_id, 'platform.roles.manage'));

create policy "Active members can view role permissions"
on public.role_permissions for select
to authenticated
using (exists (
  select 1
  from public.roles r
  where r.id = role_id
    and (r.tenant_id is null or core_private.is_active_tenant_member(r.tenant_id))
));

create policy "Role managers can manage role permissions"
on public.role_permissions for all
to authenticated
using (exists (
  select 1
  from public.roles r
  where r.id = role_id
    and r.tenant_id is not null
    and core_private.has_platform_permission(r.tenant_id, 'platform.roles.manage')
))
with check (exists (
  select 1
  from public.roles r
  where r.id = role_id
    and r.tenant_id is not null
    and core_private.has_platform_permission(r.tenant_id, 'platform.roles.manage')
));

create policy "Active members can view user roles"
on public.user_roles for select
to authenticated
using (core_private.is_active_tenant_member(tenant_id));

create policy "Role managers can manage user roles"
on public.user_roles for all
to authenticated
using (core_private.has_platform_permission(tenant_id, 'platform.roles.manage'))
with check (core_private.has_platform_permission(tenant_id, 'platform.roles.manage'));

create policy "Active members can view products"
on public.products for select
to authenticated
using (exists (
  select 1
  from public.tenant_memberships tm
  where tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

create policy "Active members can view modules"
on public.modules for select
to authenticated
using (exists (
  select 1
  from public.tenant_memberships tm
  where tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

create policy "Active members can view plans"
on public.plans for select
to authenticated
using (exists (
  select 1
  from public.tenant_memberships tm
  where tm.user_id = (select auth.uid())
    and tm.status = 'active'
));

create policy "Active members can view tenant contracts"
on public.contracts for select
to authenticated
using (core_private.is_active_tenant_member(tenant_id));

create policy "Contract managers can manage tenant contracts"
on public.contracts for all
to authenticated
using (core_private.has_platform_permission(tenant_id, 'platform.contracts.manage'))
with check (core_private.has_platform_permission(tenant_id, 'platform.contracts.manage'));

create policy "Active members can view tenant contract items"
on public.contract_items for select
to authenticated
using (core_private.is_active_tenant_member(tenant_id));

create policy "Contract managers can manage tenant contract items"
on public.contract_items for all
to authenticated
using (core_private.has_platform_permission(tenant_id, 'platform.contracts.manage'))
with check (core_private.has_platform_permission(tenant_id, 'platform.contracts.manage'));

create policy "Active members can view external resource references"
on public.external_resources for select
to authenticated
using (core_private.is_active_tenant_member(tenant_id));

create policy "Contract managers can manage external resource references"
on public.external_resources for all
to authenticated
using (core_private.has_platform_permission(tenant_id, 'platform.contracts.manage'))
with check (core_private.has_platform_permission(tenant_id, 'platform.contracts.manage'));

create policy "Active members can view tenant contract scopes"
on public.contract_scopes for select
to authenticated
using (core_private.is_active_tenant_member(tenant_id));

create policy "Contract managers can manage tenant contract scopes"
on public.contract_scopes for all
to authenticated
using (core_private.has_platform_permission(tenant_id, 'platform.contracts.manage'))
with check (core_private.has_platform_permission(tenant_id, 'platform.contracts.manage'));

create policy "Active members can view tenant subscriptions"
on public.subscriptions for select
to authenticated
using (core_private.is_active_tenant_member(tenant_id));

create policy "Active members can view tenant entitlements"
on public.entitlements for select
to authenticated
using (core_private.is_active_tenant_member(tenant_id));

create policy "Contract managers can manage tenant entitlements"
on public.entitlements for all
to authenticated
using (core_private.has_platform_permission(tenant_id, 'platform.contracts.manage'))
with check (core_private.has_platform_permission(tenant_id, 'platform.contracts.manage'));

create policy "Active members can view tenant usage limits"
on public.usage_limits for select
to authenticated
using (core_private.is_active_tenant_member(tenant_id));

create policy "Active members can view tenant branding"
on public.branding_settings for select
to authenticated
using (core_private.is_active_tenant_member(tenant_id));

create policy "Settings managers can update tenant branding"
on public.branding_settings for update
to authenticated
using (core_private.has_platform_permission(tenant_id, 'platform.settings.manage'))
with check (core_private.has_platform_permission(tenant_id, 'platform.settings.manage'));

create policy "Settings managers can create tenant branding"
on public.branding_settings for insert
to authenticated
with check (core_private.has_platform_permission(tenant_id, 'platform.settings.manage'));

create policy "Active members can view tenant audit logs"
on public.audit_logs for select
to authenticated
using (core_private.has_platform_permission(tenant_id, 'platform.audit.view'));

insert into public.permissions (code, description)
values
  ('platform.users.view', 'Visualizar usuários.'),
  ('platform.users.create', 'Criar usuários.'),
  ('platform.users.update', 'Atualizar usuários.'),
  ('platform.users.delete', 'Remover usuários.'),
  ('platform.tenants.manage', 'Gerenciar empresas.'),
  ('platform.roles.manage', 'Gerenciar papéis e permissões.'),
  ('platform.settings.manage', 'Gerenciar configurações da plataforma.'),
  ('platform.contracts.view', 'Visualizar contratos.'),
  ('platform.contracts.manage', 'Gerenciar contratos.'),
  ('platform.subscriptions.manage', 'Gerenciar assinaturas.'),
  ('platform.entitlements.manage', 'Gerenciar direitos de acesso.'),
  ('platform.audit.view', 'Visualizar auditoria.')
on conflict (code) do nothing;

insert into public.products (code, name, description, status)
values ('core-platform', 'Core Platform', 'Produto estrutural da plataforma Kynovia SaaS Core.', 'active')
on conflict (code) do nothing;

insert into public.modules (product_id, code, name, description, status)
select p.id, module_seed.code, module_seed.name, module_seed.description, module_seed.status::catalog_status
from public.products p
cross join (
  values
    ('identity', 'Identidade e sessão', 'Autenticação, sessões e provedores.', 'active'),
    ('tenant-admin', 'Administração de empresas', 'Gestão de tenants, usuários e vínculos.', 'active'),
    ('contracts', 'Contratos e assinaturas', 'Planos, contratos, assinaturas e limites.', 'pending'),
    ('audit', 'Auditoria', 'Eventos de acesso e alterações administrativas.', 'planned')
) as module_seed(code, name, description, status)
where p.code = 'core-platform'
on conflict (product_id, code) do nothing;

insert into public.roles (tenant_id, name, scope, description)
values
  (null, 'super_admin', 'global', 'Administração completa da plataforma e operação do Core.'),
  (null, 'platform_admin', 'global', 'Gestão operacional sem acesso a configurações sensíveis.'),
  (null, 'support', 'global', 'Suporte operacional da plataforma.'),
  (null, 'tenant_admin', 'tenant', 'Administração completa dentro da empresa ativa.'),
  (null, 'tenant_manager', 'tenant', 'Gestão operacional dentro da empresa ativa.'),
  (null, 'tenant_user', 'tenant', 'Uso padrão dos recursos liberados para a empresa.'),
  (null, 'viewer', 'tenant', 'Acesso de leitura para auditoria e acompanhamento.')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on true
where r.name = 'super_admin'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in (
  'platform.users.view',
  'platform.users.create',
  'platform.users.update',
  'platform.tenants.manage',
  'platform.roles.manage',
  'platform.contracts.view',
  'platform.audit.view'
)
where r.name = 'platform_admin'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in (
  'platform.users.view',
  'platform.users.create',
  'platform.users.update',
  'platform.tenants.manage',
  'platform.roles.manage',
  'platform.contracts.view'
)
where r.name = 'tenant_admin'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in (
  'platform.users.view',
  'platform.users.update',
  'platform.contracts.view'
)
where r.name = 'tenant_manager'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code = 'platform.users.view'
where r.name = 'tenant_user'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in ('platform.users.view', 'platform.contracts.view')
where r.name = 'viewer'
on conflict do nothing;
