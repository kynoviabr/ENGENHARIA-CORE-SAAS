create table if not exists public.pmt_methodology_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  code text not null,
  name text not null,
  version text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'retired')),
  travel_percent numeric(6,2) not null default 0,
  algorithm_version text not null,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  unique (tenant_id, code, version)
);

create table if not exists public.pmt_activity_codes (
  id uuid primary key default gen_random_uuid(),
  methodology_version_id uuid not null references public.pmt_methodology_versions(id) on delete cascade,
  code integer not null,
  label text not null,
  activity_group text not null check (activity_group in ('productive', 'indirect', 'loss')),
  description text not null,
  sort_order integer not null default 0,
  unique (methodology_version_id, code)
);

create table if not exists public.pmt_projects (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  methodology_version_id uuid references public.pmt_methodology_versions(id) on delete restrict,
  code text not null,
  name text not null,
  description text,
  objective text,
  client_name text not null,
  plant text not null,
  area text not null,
  operational_area text,
  period_start date not null,
  period_end date not null,
  planned_collection_days integer check (planned_collection_days is null or planned_collection_days between 1 and 120),
  planned_employee_sample integer check (planned_employee_sample is null or planned_employee_sample between 1 and 5000),
  operational_status text not null default 'draft' check (operational_status in ('draft', 'planning', 'active', 'paused', 'completed', 'cancelled')),
  commercial_status text not null default 'pending' check (commercial_status in ('pending', 'active', 'suspended', 'cancelled', 'expired')),
  core_resource_type text not null default 'project',
  core_resource_id text,
  core_contract_scope_id uuid,
  benchmark_segment text not null default 'Manutenção industrial contínua',
  activity_catalog_version text not null default 'braidotti-pmt-v2.0',
  hierarchy_catalog_version text not null default 'braidotti-org-v1.0',
  role_catalog_version text not null default 'braidotti-roles-v1.0',
  collection_mode text not null default 'hybrid' check (collection_mode in ('self_report', 'observer', 'hybrid')),
  costing_mode text check (costing_mode in ('direct_indirect', 'direct_only', 'later')),
  target_coverage numeric(6,2) not null default 85,
  progress_percentage numeric(6,2) not null default 0,
  teams text[] not null default '{}'::text[],
  shifts text[] not null default '{}'::text[],
  disciplines text[] not null default '{}'::text[],
  project_hierarchy jsonb not null default '[]'::jsonb,
  project_roles jsonb not null default '[]'::jsonb,
  project_manager_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  unique (tenant_id, code)
);

create table if not exists public.pmt_project_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  project_id uuid not null references public.pmt_projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_code text not null,
  status text not null default 'invited' check (status in ('invited', 'active', 'suspended', 'removed')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  unique (tenant_id, project_id, user_id)
);

create table if not exists public.pmt_employees (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  employee_code text not null,
  full_name text not null,
  email text not null,
  company_unit text not null,
  maintenance_area text not null,
  team text not null,
  shift text not null,
  discipline text not null,
  role text not null,
  hierarchy_level text not null default 'L4' check (hierarchy_level in ('L1', 'L2', 'L3', 'L4', 'L5', 'L6')),
  hierarchy_label text not null default 'Mecânico',
  cost_type text not null default 'direct' check (cost_type in ('direct', 'indirect')),
  status text not null default 'active' check (status in ('active', 'inactive')),
  can_self_report boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  unique (tenant_id, employee_code)
);

create table if not exists public.pmt_employee_costs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  employee_id uuid not null references public.pmt_employees(id) on delete cascade,
  hourly_cost numeric(12,2) not null default 0 check (hourly_cost >= 0),
  currency_code text not null default 'BRL',
  effective_from date not null default current_date,
  effective_to date,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  unique (tenant_id, employee_id, effective_from)
);

create table if not exists public.pmt_validation_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  code text not null default 'global',
  daily_assignable_minutes integer not null default 480 check (daily_assignable_minutes > 0 and daily_assignable_minutes <= 1440),
  weekly_assignable_minutes integer not null default 2400 check (weekly_assignable_minutes > 0 and weekly_assignable_minutes <= 10080),
  complement_activity_code integer not null default 10,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  unique (tenant_id, code)
);

create table if not exists public.pmt_project_employee_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  project_id uuid not null references public.pmt_projects(id) on delete cascade,
  employee_id uuid not null references public.pmt_employees(id) on delete cascade,
  team text,
  role text,
  status text not null default 'active' check (status in ('active', 'paused', 'removed')),
  starts_at date,
  ends_at date,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  unique (tenant_id, project_id, employee_id)
);

create table if not exists public.pmt_project_activities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  project_id uuid not null references public.pmt_projects(id) on delete cascade,
  source_activity_code integer,
  code integer not null,
  name text not null,
  description text,
  category text not null check (category in ('productive', 'indirect', 'loss')),
  unit_of_measure text not null default 'minute',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  unique (tenant_id, project_id, code)
);

create table if not exists public.pmt_observations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  project_id uuid not null references public.pmt_projects(id) on delete cascade,
  client_generated_id uuid not null,
  observed_at timestamptz not null,
  timezone text not null,
  observer_user_id uuid references public.profiles(id) on delete set null,
  collaborator_code text not null,
  team text,
  shift text,
  discipline text,
  work_order text,
  activity_code integer not null,
  duration_seconds integer not null check (duration_seconds > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  note text,
  validation_note text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  unique (tenant_id, client_generated_id)
);

create table if not exists public.pmt_calculation_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  project_id uuid not null references public.pmt_projects(id) on delete cascade,
  snapshot_hash text not null,
  algorithm_version text not null,
  methodology_version text not null,
  total_seconds integer not null,
  productive_seconds integer not null,
  a_percent numeric(8,3) not null,
  travel_percent numeric(8,3) not null,
  fatigue_percent numeric(8,3) not null,
  fp_percent numeric(8,3) not null,
  coverage_percent numeric(8,3) not null,
  validated_report_count integer not null default 0,
  entry_count integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'approved', 'published', 'superseded')),
  inputs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  unique (tenant_id, project_id, snapshot_hash, algorithm_version)
);

create table if not exists public.pmt_daily_reports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  project_id uuid not null references public.pmt_projects(id) on delete cascade,
  employee_id uuid not null references public.pmt_employees(id) on delete restrict,
  author_user_id uuid references public.profiles(id) on delete set null,
  report_date date not null,
  shift text not null,
  total_reported_seconds integer not null default 0 check (total_reported_seconds >= 0),
  status text not null default 'draft' check (status in ('draft', 'submitted', 'validated', 'rejected')),
  submitted_at timestamptz,
  validated_at timestamptz,
  validated_by uuid references public.profiles(id) on delete set null,
  validation_note text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  unique (tenant_id, project_id, employee_id, report_date, shift)
);

create table if not exists public.pmt_daily_report_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  daily_report_id uuid not null references public.pmt_daily_reports(id) on delete cascade,
  project_activity_id uuid references public.pmt_project_activities(id) on delete restrict,
  employee_id uuid references public.pmt_employees(id) on delete restrict,
  user_id uuid references public.profiles(id) on delete set null,
  sequence integer not null check (sequence > 0),
  start_time time not null,
  end_time time not null,
  duration_seconds integer not null check (duration_seconds > 0),
  work_order text,
  activity_code integer not null,
  note text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  unique (tenant_id, daily_report_id, sequence)
);

create table if not exists public.pmt_daily_report_reclassifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  daily_report_id uuid not null references public.pmt_daily_reports(id) on delete cascade,
  daily_report_entry_id uuid not null references public.pmt_daily_report_entries(id) on delete cascade,
  previous_activity_code integer not null,
  new_activity_code integer not null,
  justification text not null,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

create table if not exists public.pmt_action_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  project_id uuid not null references public.pmt_projects(id) on delete cascade,
  title text not null,
  owner_name text not null,
  due_date date,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'blocked')),
  estimated_benefit_percent numeric(8,3) not null default 0,
  evidence_url text,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz
);

create table if not exists public.pmt_project_documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  project_id uuid not null references public.pmt_projects(id) on delete cascade,
  name text not null,
  document_date date not null default current_date,
  document_type text not null check (document_type in ('foto', 'ata', 'escopo', 'modelo', 'material_apoio', 'evidencias')),
  storage_bucket text not null default 'pmt-project-documents',
  storage_path text not null,
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes > 0),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  deleted_at timestamptz,
  check (storage_path like ('tenant/' || tenant_id::text || '/project/' || project_id::text || '/document/%')),
  unique (tenant_id, storage_bucket, storage_path)
);

create schema if not exists pmt_private;

create or replace function pmt_private.can_access_project(
  check_tenant_id uuid,
  check_project_id uuid,
  permission_code text
)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select
    core_private.has_platform_permission(check_tenant_id, 'pmt.projects.update')
    or (
      core_private.has_platform_permission(check_tenant_id, permission_code)
      and exists (
        select 1
        from public.pmt_project_memberships membership
        where membership.tenant_id = check_tenant_id
          and membership.project_id = check_project_id
          and membership.user_id = auth.uid()
          and membership.status = 'active'
      )
    );
$$;

create or replace function pmt_private.can_access_daily_report(
  check_tenant_id uuid,
  check_daily_report_id uuid,
  permission_code text
)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.pmt_daily_reports report
    where report.tenant_id = check_tenant_id
      and report.id = check_daily_report_id
      and pmt_private.can_access_project(report.tenant_id, report.project_id, permission_code)
  );
$$;

alter table public.pmt_methodology_versions enable row level security;
alter table public.pmt_activity_codes enable row level security;
alter table public.pmt_projects enable row level security;
alter table public.pmt_project_memberships enable row level security;
alter table public.pmt_employees enable row level security;
alter table public.pmt_employee_costs enable row level security;
alter table public.pmt_validation_rules enable row level security;
alter table public.pmt_project_employee_assignments enable row level security;
alter table public.pmt_project_activities enable row level security;
alter table public.pmt_observations enable row level security;
alter table public.pmt_calculation_runs enable row level security;
alter table public.pmt_daily_reports enable row level security;
alter table public.pmt_daily_report_entries enable row level security;
alter table public.pmt_daily_report_reclassifications enable row level security;
alter table public.pmt_action_items enable row level security;
alter table public.pmt_project_documents enable row level security;

create policy "pmt projects view" on public.pmt_projects
  for select to authenticated
  using (pmt_private.can_access_project(tenant_id, id, 'pmt.projects.view'));

create policy "pmt projects create" on public.pmt_projects
  for insert to authenticated
  with check (core_private.has_platform_permission(tenant_id, 'pmt.projects.create'));

create policy "pmt projects update" on public.pmt_projects
  for update to authenticated
  using (core_private.has_platform_permission(tenant_id, 'pmt.projects.update'))
  with check (core_private.has_platform_permission(tenant_id, 'pmt.projects.update'));

create policy "pmt project memberships view" on public.pmt_project_memberships
  for select to authenticated
  using (
    core_private.has_platform_permission(tenant_id, 'pmt.projects.update')
    or (
      core_private.has_platform_permission(tenant_id, 'pmt.projects.view')
      and user_id = auth.uid()
      and status = 'active'
    )
  );

create policy "pmt project memberships manage" on public.pmt_project_memberships
  for all to authenticated
  using (core_private.has_platform_permission(tenant_id, 'pmt.project_memberships.manage'))
  with check (core_private.has_platform_permission(tenant_id, 'pmt.project_memberships.manage'));

create policy "pmt observations view" on public.pmt_observations
  for select to authenticated
  using (pmt_private.can_access_project(tenant_id, project_id, 'pmt.projects.view'));

create policy "pmt observations create" on public.pmt_observations
  for insert to authenticated
  with check (pmt_private.can_access_project(tenant_id, project_id, 'pmt.observations.create'));

create policy "pmt observations validate" on public.pmt_observations
  for update to authenticated
  using (pmt_private.can_access_project(tenant_id, project_id, 'pmt.observations.validate'))
  with check (pmt_private.can_access_project(tenant_id, project_id, 'pmt.observations.validate'));

create policy "pmt employees view" on public.pmt_employees
  for select to authenticated
  using (core_private.has_platform_permission(tenant_id, 'pmt.employees.view'));

create policy "pmt employees create" on public.pmt_employees
  for insert to authenticated
  with check (core_private.has_platform_permission(tenant_id, 'pmt.employees.create'));

create policy "pmt employees update" on public.pmt_employees
  for update to authenticated
  using (core_private.has_platform_permission(tenant_id, 'pmt.employees.update'))
  with check (core_private.has_platform_permission(tenant_id, 'pmt.employees.update'));

create policy "pmt employee costs view" on public.pmt_employee_costs
  for select to authenticated
  using (core_private.has_platform_permission(tenant_id, 'pmt.costs.view'));

create policy "pmt employee costs manage" on public.pmt_employee_costs
  for all to authenticated
  using (core_private.has_platform_permission(tenant_id, 'pmt.costs.manage'))
  with check (core_private.has_platform_permission(tenant_id, 'pmt.costs.manage'));

create policy "pmt validation rules view" on public.pmt_validation_rules
  for select to authenticated
  using ((tenant_id is null and status = 'active') or core_private.has_platform_permission(tenant_id, 'pmt.settings.manage'));

create policy "pmt validation rules manage" on public.pmt_validation_rules
  for all to authenticated
  using (core_private.has_platform_permission(tenant_id, 'pmt.methodologies.manage'))
  with check (tenant_id is not null and core_private.has_platform_permission(tenant_id, 'pmt.methodologies.manage'));

create policy "pmt project employee assignments view" on public.pmt_project_employee_assignments
  for select to authenticated
  using (pmt_private.can_access_project(tenant_id, project_id, 'pmt.employees.view'));

create policy "pmt project employee assignments manage" on public.pmt_project_employee_assignments
  for all to authenticated
  using (pmt_private.can_access_project(tenant_id, project_id, 'pmt.employees.update'))
  with check (pmt_private.can_access_project(tenant_id, project_id, 'pmt.employees.update'));

create policy "pmt project activities view" on public.pmt_project_activities
  for select to authenticated
  using (pmt_private.can_access_project(tenant_id, project_id, 'pmt.projects.view'));

create policy "pmt project activities manage" on public.pmt_project_activities
  for all to authenticated
  using (pmt_private.can_access_project(tenant_id, project_id, 'pmt.projects.update'))
  with check (pmt_private.can_access_project(tenant_id, project_id, 'pmt.projects.update'));

create policy "pmt daily reports view" on public.pmt_daily_reports
  for select to authenticated
  using (pmt_private.can_access_project(tenant_id, project_id, 'pmt.daily_reports.view'));

create policy "pmt daily reports create" on public.pmt_daily_reports
  for insert to authenticated
  with check (pmt_private.can_access_project(tenant_id, project_id, 'pmt.daily_reports.create'));

create policy "pmt daily reports update" on public.pmt_daily_reports
  for update to authenticated
  using (pmt_private.can_access_project(tenant_id, project_id, 'pmt.daily_reports.submit') or pmt_private.can_access_project(tenant_id, project_id, 'pmt.daily_reports.validate'))
  with check (pmt_private.can_access_project(tenant_id, project_id, 'pmt.daily_reports.submit') or pmt_private.can_access_project(tenant_id, project_id, 'pmt.daily_reports.validate'));

create policy "pmt daily report entries view" on public.pmt_daily_report_entries
  for select to authenticated
  using (pmt_private.can_access_daily_report(tenant_id, daily_report_id, 'pmt.daily_reports.view'));

create policy "pmt daily report entries create" on public.pmt_daily_report_entries
  for insert to authenticated
  with check (pmt_private.can_access_daily_report(tenant_id, daily_report_id, 'pmt.daily_reports.create'));

create policy "pmt daily report entries update" on public.pmt_daily_report_entries
  for update to authenticated
  using (pmt_private.can_access_daily_report(tenant_id, daily_report_id, 'pmt.daily_reports.create') or pmt_private.can_access_daily_report(tenant_id, daily_report_id, 'pmt.daily_reports.validate'))
  with check (pmt_private.can_access_daily_report(tenant_id, daily_report_id, 'pmt.daily_reports.create') or pmt_private.can_access_daily_report(tenant_id, daily_report_id, 'pmt.daily_reports.validate'));

create policy "pmt daily report reclassifications view" on public.pmt_daily_report_reclassifications
  for select to authenticated
  using (pmt_private.can_access_daily_report(tenant_id, daily_report_id, 'pmt.daily_reports.validate'));

create policy "pmt daily report reclassifications create" on public.pmt_daily_report_reclassifications
  for insert to authenticated
  with check (pmt_private.can_access_daily_report(tenant_id, daily_report_id, 'pmt.daily_reports.validate'));

create policy "pmt calculations view" on public.pmt_calculation_runs
  for select to authenticated
  using (pmt_private.can_access_project(tenant_id, project_id, 'pmt.reports.view'));

create policy "pmt calculations manage" on public.pmt_calculation_runs
  for all to authenticated
  using (pmt_private.can_access_project(tenant_id, project_id, 'pmt.calculations.run'))
  with check (pmt_private.can_access_project(tenant_id, project_id, 'pmt.calculations.run'));

create policy "pmt actions view" on public.pmt_action_items
  for select to authenticated
  using (pmt_private.can_access_project(tenant_id, project_id, 'pmt.projects.view'));

create policy "pmt actions manage" on public.pmt_action_items
  for all to authenticated
  using (pmt_private.can_access_project(tenant_id, project_id, 'pmt.action_items.manage'))
  with check (pmt_private.can_access_project(tenant_id, project_id, 'pmt.action_items.manage'));

create policy "pmt project documents view" on public.pmt_project_documents
  for select to authenticated
  using (pmt_private.can_access_project(tenant_id, project_id, 'pmt.documents.view'));

create policy "pmt project documents manage" on public.pmt_project_documents
  for all to authenticated
  using (pmt_private.can_access_project(tenant_id, project_id, 'pmt.documents.manage'))
  with check (pmt_private.can_access_project(tenant_id, project_id, 'pmt.documents.manage'));

create policy "pmt methodology view" on public.pmt_methodology_versions
  for select to authenticated
  using ((tenant_id is null and status = 'active') or core_private.has_platform_permission(tenant_id, 'pmt.methodologies.manage'));

create policy "pmt methodology manage" on public.pmt_methodology_versions
  for all to authenticated
  using (core_private.has_platform_permission(tenant_id, 'pmt.methodologies.manage'))
  with check (tenant_id is not null and core_private.has_platform_permission(tenant_id, 'pmt.methodologies.manage'));

create policy "pmt codes view" on public.pmt_activity_codes
  for select to authenticated
  using (
    exists (
      select 1
      from public.pmt_methodology_versions methodology
      where methodology.id = pmt_activity_codes.methodology_version_id
        and (
          (methodology.tenant_id is null and methodology.status = 'active')
          or core_private.has_platform_permission(methodology.tenant_id, 'pmt.methodologies.manage')
          or core_private.has_platform_permission(methodology.tenant_id, 'pmt.settings.manage')
        )
    )
  );

grant select, insert, update on table
  public.pmt_methodology_versions,
  public.pmt_activity_codes,
  public.pmt_projects,
  public.pmt_project_memberships,
  public.pmt_employees,
  public.pmt_employee_costs,
  public.pmt_validation_rules,
  public.pmt_project_employee_assignments,
  public.pmt_project_activities,
  public.pmt_observations,
  public.pmt_calculation_runs,
  public.pmt_daily_reports,
  public.pmt_daily_report_entries,
  public.pmt_daily_report_reclassifications,
  public.pmt_action_items,
  public.pmt_project_documents
to authenticated, service_role;

grant delete on table
  public.pmt_project_memberships,
  public.pmt_project_employee_assignments,
  public.pmt_project_activities,
  public.pmt_daily_report_entries
to authenticated, service_role;

grant delete on table
  public.pmt_methodology_versions,
  public.pmt_activity_codes,
  public.pmt_projects,
  public.pmt_employees,
  public.pmt_employee_costs,
  public.pmt_validation_rules,
  public.pmt_observations,
  public.pmt_calculation_runs,
  public.pmt_daily_reports,
  public.pmt_daily_report_reclassifications,
  public.pmt_action_items,
  public.pmt_project_documents
to service_role;

grant usage on schema pmt_private to authenticated, service_role;
grant execute on function pmt_private.can_access_project(uuid, uuid, text) to authenticated, service_role;
grant execute on function pmt_private.can_access_daily_report(uuid, uuid, text) to authenticated, service_role;

insert into storage.buckets (id, name, public)
values ('pmt-project-documents', 'pmt-project-documents', false)
on conflict (id) do nothing;

create policy "pmt project document objects view" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'pmt-project-documents'
    and (storage.foldername(name))[1] = 'tenant'
    and (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and (storage.foldername(name))[3] = 'project'
    and (storage.foldername(name))[4] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and pmt_private.can_access_project(((storage.foldername(name))[2])::uuid, ((storage.foldername(name))[4])::uuid, 'pmt.documents.view')
  );

create policy "pmt project document objects manage" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'pmt-project-documents'
    and (storage.foldername(name))[1] = 'tenant'
    and (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and (storage.foldername(name))[3] = 'project'
    and (storage.foldername(name))[4] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and pmt_private.can_access_project(((storage.foldername(name))[2])::uuid, ((storage.foldername(name))[4])::uuid, 'pmt.documents.manage')
  )
  with check (
    bucket_id = 'pmt-project-documents'
    and (storage.foldername(name))[1] = 'tenant'
    and (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and (storage.foldername(name))[3] = 'project'
    and (storage.foldername(name))[4] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and pmt_private.can_access_project(((storage.foldername(name))[2])::uuid, ((storage.foldername(name))[4])::uuid, 'pmt.documents.manage')
  );

insert into public.permissions (code, description)
values
  ('pmt.dashboard.view', 'Permite acessar indicadores do produto PMT.'),
  ('pmt.projects.view', 'Permite listar e abrir projetos PMT.'),
  ('pmt.projects.create', 'Permite criar novos projetos PMT.'),
  ('pmt.projects.update', 'Permite editar, arquivar e gerir planos de acao.'),
  ('pmt.project_memberships.manage', 'Permite vincular usuarios do tenant a projetos PMT sem substituir roles do Core.'),
  ('pmt.employees.view', 'Permite listar funcionarios da manutencao medidos pelo PMT.'),
  ('pmt.costs.view', 'Permite visualizar custos horarios e classificacoes financeiras sensiveis.'),
  ('pmt.costs.manage', 'Permite cadastrar e atualizar custos horarios e classificacoes financeiras sensiveis.'),
  ('pmt.employees.create', 'Permite cadastrar funcionarios da manutencao.'),
  ('pmt.employees.update', 'Permite atualizar ou inativar funcionarios da manutencao.'),
  ('pmt.employees.import', 'Permite importar funcionarios por planilha.'),
  ('pmt.daily_reports.view', 'Permite listar e abrir diarios digitais de rotina e horas.'),
  ('pmt.daily_reports.create', 'Permite registrar diarios digitais de rotina e horas.'),
  ('pmt.daily_reports.submit', 'Permite enviar diarios para validacao.'),
  ('pmt.daily_reports.validate', 'Permite validar, rejeitar ou reclassificar diarios.'),
  ('pmt.observations.create', 'Permite registrar observacoes de campo.'),
  ('pmt.observations.validate', 'Permite aprovar, rejeitar e reclassificar observacoes.'),
  ('pmt.calculations.run', 'Permite gerar snapshots e rodadas de calculo.'),
  ('pmt.analysis.view', 'Permite acessar diagnosticos, benchmarks e recomendacoes.'),
  ('pmt.reports.view', 'Permite acessar relatorios e exportacoes.'),
  ('pmt.documents.view', 'Permite visualizar documentos e evidencias do projeto PMT.'),
  ('pmt.documents.manage', 'Permite enviar, atualizar e remover documentos do projeto PMT.'),
  ('pmt.action_items.manage', 'Permite criar e atualizar itens do plano de acao PMT.'),
  ('pmt.methodologies.manage', 'Permite administrar metodologia, regras e catalogos globais PMT.'),
  ('pmt.settings.manage', 'Permite administrar catalogos e parametros PMT.')
on conflict (code) do nothing;
