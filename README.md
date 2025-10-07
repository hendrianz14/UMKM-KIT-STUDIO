# UMKM KitStudio — Server-Side Credit Enforcement

This iteration hardens the AI workflow so that every API call is authenticated, rate-limited, balanced against the user wallet, and fully auditable. Front-end logic now delegates credit checks and API-key storage to the server, ensuring a single source of truth.

## What Changed
- Added Supabase-backed authentication to every generate/analyze handler and `/api/user/api-key`.
- Enforced wallet balance checks, per-user/IP rate limiting, and prompt guardrails (required phrase, banned keyword filter, 5 MB image cap, MIME whitelist).
- Logged every AI job through the `spend_credits_and_log_job` RPC so credit debits and job inserts happen atomically.
- Moved API-key management to `/api/user/api-key` with AES-256-GCM encryption (secret derived from `USER_API_KEY_SECRET`).
- Replaced the static `/api/bootstrap` payload with live Supabase data (user profile, wallet, last 5 projects, last 5 credit transactions, API-key status).
- Removed client-side credit deduction/localStorage logic; UI now refreshes from `/api/bootstrap` after the server settles balances.

## Backend Details
- **Handlers updated**: `app/api/generate/image`, `app/api/generate/caption`, `app/api/user/api-key`, `app/api/bootstrap`.
- **Helpers added**: `lib/server/http-error`, `lib/server/auth`, `lib/server/rate-limit`, `lib/server/credits`, `lib/server/prompt`, `lib/server/user-api-key`.
- **Credit costs**: analyze (0), generate (1), caption (1) unless the user toggles their own API key.
- **Prompt guard**: every generation prompt now appends `professional photography that looks social-media-ready`; dangerous keywords trigger a 400.
- **Limits**: images must be JPEG/PNG/WebP and ≤ 5 MB.
- **Rate limit defaults**: 12 requests/minute for `/api/generate/image`, 20 requests/minute for `/api/generate/caption`, 30/10 for `/api/user/api-key` (GET/mutations).

### Required Supabase Artifacts
1. **Tables** (expected columns at minimum):
   - `profiles(user_id, name, plan, plan_expires_at)`
   - `credits_wallet(user_id, balance)`
   - `credits_ledger(id, user_id, amount, reason, transaction_no, created_at)`
   - `projects(id, user_id, title, type, image_url, created_at)`
   - `generations(id, user_id, status, created_at)` *(used for weekly stats)*
   - `jobs(id, user_id, status, job_type, prompt, cost, output_url, metadata, created_at)`
   - `user_api_keys(user_id primary key, encrypted_key, updated_at)`

2. **RPC** `spend_credits_and_log_job` (called from `lib/server/credits.ts`):
```sql
create or replace function public.spend_credits_and_log_job(
  p_job_id uuid,
  p_user_id uuid,
  p_cost numeric,
  p_status text,
  p_prompt text,
  p_job_type text,
  p_output_url text,
  p_metadata jsonb
) returns void
language plpgsql
as $$
declare
begin
  perform 1
    from credits_wallet
   where user_id = p_user_id
     for update;

  if p_cost > 0 then
    update credits_wallet
       set balance = balance - p_cost
     where user_id = p_user_id;

    insert into credits_ledger (user_id, amount, reason, transaction_no)
    values (p_user_id, -p_cost, 'generation', extract(epoch from now()));
  end if;

  insert into jobs (id, user_id, status, job_type, cost, prompt, output_url, metadata)
  values (p_job_id, p_user_id, p_status, p_job_type, p_cost, p_prompt, p_output_url, p_metadata);
end;
$$;
```
Adjust column names to match your schema. The function must run in a single transaction (default behavior) so credits and jobs stay in sync.

3. **Encryption secret**: set `USER_API_KEY_SECRET` (any long random string) in your environment; it seeds the AES-256-GCM key derivation.

## Front-End Adjustments
- `GenerateImagePage` now:
  - fetches the masked API-key status from `/api/user/api-key` on mount,
  - sends only `useOwnApiKey` to the server (no more raw keys in the browser),
  - refreshes dashboard data via the new `AppContext.refreshAppData()` when credits change,
  - handles HTTP 402/429 responses with localized messages.
- `SettingsPage` persists API keys via the new API endpoint, never touching `localStorage`.
- `AppContext` exposes `refreshAppData` and no longer tracks client-side credit deductions.

## How to Enable the Feature Set
1. **Environment**
   - Configure existing Supabase vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc.).
   - Add `USER_API_KEY_SECRET` (32+ characters).
   - Provide a fallback Gemini API key in `API_KEY` if users are allowed to rely on the platform key.
2. **Database**
   - Ensure wallet, ledger, job, project, and `user_api_keys` tables exist with the columns noted above.
   - Create the `spend_credits_and_log_job` RPC (or adjust `RPC_NAME` in `lib/server/credits.ts` to match your stored procedure).
   - Seed `credits_wallet.balance` for existing users.
3. **Testing**
   - `npm run lint`
   - Exercise `/api/generate/image` and `/api/generate/caption` in both modes (platform key vs. own key) and confirm:
     - HTTP 402 when credits are insufficient,
     - `jobs` + `credits_ledger` receive rows,
     - wallet balances change only after success,
     - rate limiting returns HTTP 429 with `Retry-After`.
   - Verify `/api/user/api-key` GET/POST/DELETE lifecycles and that the masked key appears in Settings.
   - Hit `/api/bootstrap` to confirm it returns live data (ISO timestamps, last 5 items).

## Verification Checklist
- [ ] Authenticated requests succeed; unauthenticated ones return 401.
- [ ] Jobs are recorded with prompts, cost, required phrase, and metadata.
- [ ] Wallet debits only occur for platform-key usage.
- [ ] Guardrails block disallowed keywords and oversize/unsupported images.
- [ ] Dashboard reflects updated credit balances after generation.
- [ ] API keys are encrypted server-side and never stored in the browser.

With these pieces configured, all AI-related calls now run through a secure, auditable pipeline while the UI simply reflects the authoritative state from Supabase.