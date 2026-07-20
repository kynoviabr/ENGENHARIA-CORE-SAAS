# Supabase RLS Strategy

This project is not connected to a Supabase project yet. The SQL in
`supabase/migrations/20260715123000_initial_core_schema.sql` is an offline
starting point for the dedicated Kynovia SaaS Core Supabase project.

## Principles

- Every table in `public` has Row Level Security enabled.
- Tenant-owned tables use `tenant_id` and restrict access through active memberships.
- Authorization data lives in tables, not in user-editable metadata.
- Policies use `TO authenticated` plus explicit predicates.
- Update policies include both `USING` and `WITH CHECK`.
- Membership helper functions live in the private `core_private` schema.
- The helper functions use `security definer` only to avoid recursive RLS while checking memberships and permissions.
- Execution on helper functions is revoked from `public` and granted only to `authenticated`.
- The service role key must stay server-only.

## Tenant Access

The base helper is:

```sql
core_private.is_active_tenant_member(target_tenant_id uuid)
```

It allows access only when:

- the current `auth.uid()` has an active membership;
- the membership belongs to the target tenant;
- the tenant itself is active.

## Permission Checks

The base permission helper is:

```sql
core_private.has_platform_permission(target_tenant_id uuid, permission_code text)
```

It checks memberships, assigned roles, role permissions, and permission codes.

## Validation When Supabase Exists

After creating the dedicated Supabase project:

1. Install or authenticate the Supabase CLI.
2. Run the migration against a development database.
3. Run database advisors.
4. Test RLS with authenticated users from different tenants.
5. Confirm tables exposed through the Data API have only the necessary grants.

Do not expose `SUPABASE_SERVICE_ROLE_KEY` in client code.
