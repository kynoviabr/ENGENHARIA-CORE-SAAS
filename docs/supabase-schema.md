# Supabase Schema

Initial schema file:

```text
supabase/migrations/20260715123000_initial_core_schema.sql
```

## Core Tables

- `profiles`: application profile linked to `auth.users`.
- `tenants`: companies/organizations that isolate operational data.
- `tenant_memberships`: user-to-tenant relationship and membership status.
- `permissions`: permission catalog using stable string codes.
- `roles`: global and tenant-scoped roles.
- `role_permissions`: permissions assigned to roles.
- `user_roles`: roles assigned to users inside a tenant context.
- `products`: generic product catalog.
- `modules`: generic modules per product.
- `plans`: commercial plan definitions and contracted limits.
- `contracts`: commercial agreement between tenant and plan.
- `contract_items`: products, modules, services or resources included in each contract.
- `external_resources`: generic reference index for resources owned by connected products.
- `contract_scopes`: contract coverage for external resources such as projects, units or workspaces.
- `subscriptions`: operational access period for a tenant.
- `entitlements`: products/modules/resources enabled for a tenant.
- `usage_limits`: contracted usage limits and current usage.
- `branding_settings`: tenant visual identity settings.
- `audit_logs`: tenant-aware audit trail.

## Relationship Summary

```text
auth.users
  -> profiles
  -> tenant_memberships
  -> tenants

profiles + tenants
  -> user_roles
  -> roles
  -> role_permissions
  -> permissions

tenants
  -> contracts
  -> contract_items
  -> contract_scopes
  -> external_resources
  -> subscriptions
  -> plans

products
  -> modules

tenants + products/modules/resources
  -> entitlements
```

## Notes

- `tenant_id` is mandatory for tenant-owned operational data.
- Tables in `public` have RLS enabled.
- Membership and permission checks are centralized in `core_private` helper functions.
- Seed data includes permission codes, core product/modules, default roles, and role-permission mappings.

## Planned Commercial Evolution

The commercial model will evolve through incremental migrations. The roadmap is documented in:

```text
docs/core-commercial-roadmap.md
```

Important constraints:

- do not create `public.users`; use `auth.users` plus `profiles`;
- keep `entitlements` as the canonical source for tenant product/module/resource access;
- do not create `tenant_products` or `tenant_modules` as competing sources of truth;
- evolve `branding_settings` instead of creating a parallel `brandings` table;
- use `contract_scopes` and optional `external_resources` for commercial references to external systems.
