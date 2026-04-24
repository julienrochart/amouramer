-- Enable Row Level Security on all tables.
-- Prisma connects as the `postgres` role which bypasses RLS, so the app is unaffected.
-- No policies are created: this denies all access to `anon` / `authenticated` roles
-- exposed via the Supabase PostgREST API.

ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Registration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WaitlistEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EventProduct" ENABLE ROW LEVEL SECURITY;
