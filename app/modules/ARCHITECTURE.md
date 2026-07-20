# Module Architecture

This product is a multi-tenant SaaS application. New code should be placed under
`app/modules/<domain>` and split by responsibility.

Current domains:

- `auth`
- `companies`
- `staff`
- `customers`
- `service-requests`
- `appointments`
- `work-records`
- `devices`
- `ai-content`
- `whatsapp-templates`
- `pdf`
- `settings`
- `shared`

Recommended layout for each domain:

- `types.ts`
- `validation.ts`
- `server/repository.ts`
- `server/service.ts`
- `components/*.tsx`
- `tests/*.test.mjs`

Rules:

- Client components must not import server-only files.
- API routes must derive `company_id` from the verified server session.
- Client-provided `company_id` must be ignored.
- Write operations must use tenant-safe repository helpers.
- Owner-only operations require the `owner` role.
- Admin operations allow `owner` and `admin`.
- Staff can read and create operational records, but cannot perform owner/admin actions.
