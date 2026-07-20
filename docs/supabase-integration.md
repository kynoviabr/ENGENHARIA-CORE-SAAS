# Supabase Integration Layer

The app now has a Supabase integration layer without requiring a real Supabase project yet.

## Files

```text
src/core/supabase/config.ts
src/core/supabase/client.ts
src/core/supabase/server.ts
src/core/supabase/database.types.ts
src/core/repositories
```

## Runtime Mode

The app uses this rule:

```text
NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY present -> supabase
missing env vars -> mock
```

The current mode is shown on `/configuracoes` in the "Fonte de dados" card.

## Clients

- `getSupabaseBrowserClient()` is for client components.
- `getSupabaseServerClient()` is for Server Components, Route Handlers, and Server Actions.
- Both return `null` when Supabase env vars are missing.

## Repositories

Repositories live in `src/core/repositories` and isolate persistence from UI.
They currently fall back to `src/core/mock-store.ts` when Supabase is not configured.

When the dedicated Supabase project exists:

1. Fill `.env.local`.
2. Apply migrations.
3. Generate official database types from Supabase CLI.
4. Replace the manual `database.types.ts` with generated types.
5. Expand repositories to cover all UI service queries.
