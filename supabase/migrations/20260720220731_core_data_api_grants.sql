grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete on table
  public.profiles,
  public.tenants,
  public.tenant_memberships,
  public.permissions,
  public.roles,
  public.role_permissions,
  public.user_roles,
  public.products,
  public.modules,
  public.plans,
  public.contracts,
  public.contract_items,
  public.external_resources,
  public.contract_scopes,
  public.subscriptions,
  public.entitlements,
  public.usage_limits,
  public.branding_settings,
  public.audit_logs
to authenticated, service_role;

grant usage on schema core_private to authenticated, service_role;
grant execute on function core_private.is_active_tenant_member(uuid) to authenticated, service_role;
grant execute on function core_private.has_platform_permission(uuid, text) to authenticated, service_role;
