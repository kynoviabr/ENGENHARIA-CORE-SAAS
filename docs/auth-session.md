# Auth And Session Foundation

The Core app has a session foundation that works before the dedicated Supabase project exists.

## Public Routes

```text
/login
/recuperar-senha
/confirmar-email
```

These routes are UI-ready for Supabase Auth. Until Supabase is configured, `/login` links into the mock session.

## Admin Guard

Admin routes are wrapped by `src/app/(admin)/layout.tsx`, which calls:

```ts
requireSession()
```

Behavior:

- without Supabase env vars in development: returns the mock Amanda/Kynovia Labs session;
- without Supabase env vars in production: redirects to `/login`, unless `ALLOW_MOCK_AUTH=true` is explicitly set;
- with Supabase env vars: checks `supabase.auth.getUser()`;
- with Supabase configured and no authenticated user: redirects to `/login`.

## Session Shape

The session includes:

- user id, name, email;
- active tenant;
- tenant list;
- role names;
- permission codes;
- runtime mode: `mock` or `supabase`.

The header tenant selector uses this session and will become the source of active tenant context for CRUD flows.
