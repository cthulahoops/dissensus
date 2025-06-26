# Design Thoughts – Next.js + Supabase Sleep Tracker

## 1  Objectives
* Stop depending on the external sleep-tracking service.
* Collect and own the raw data.
* Make it accessible from any device (phone, laptop, tablet).
* Preserve the interactive dashboard you already built and keep the codebase small enough to hack on for fun.

## 2  Options Considered
| Option | Pros | Cons |
|--------|------|------|
| **Browser-only (localStorage / IndexedDB)** | Zero back-end, works offline, easiest prototype | Single-device store, no server-side aggregation, export/sync pain |
| **File-based (Dropbox / Syncthing)** | Still no server code, files automatically sync | Not query-friendly; conflicts; harder future features |
| **Small hosted DB (Postgres, Firestore, etc.)** | One source of truth, easy multi-device, server-side analytics possible | Requires an account somewhere, need auth & deployment |

### Why Next.js + Supabase was picked
* You want to learn Next.js – this gives you a modern React framework *and* serverless API routes in one repo.
* Supabase provides Postgres, auth and storage under a free tier; integrates cleanly with Next via its JS client.
* Vercel deploys a Next.js repo with 1-click and gives HTTPS + CDN for free.

### Alternative: Supabase-only (no custom backend)
* **Supabase auto-generates REST/GraphQL APIs** from your database schema
* **Row-Level Security (RLS)** handles auth at the database level
* **Frontend-only**: React/Vue/vanilla JS directly calls Supabase APIs
* **Hosting**: Static site (Netlify/Vercel/GitHub Pages) + Supabase backend
* **Pros**: Simpler, no custom API code, real-time subscriptions built-in
* **Cons**: Less control over API logic, harder to add complex business rules

## 3  High-level Architecture

### Option A: Next.js + Custom API + Supabase
```
 ┌───────────────┐   HTTPS    ┌─────────────┐
 │  Browser /    │──────────►│ Next.js API │──┐
 │  PWA / Phone  │  JSON     └─────────────┘  │ SQL
 └───────────────┘  /api/...        ▲         ▼
        ▲   ▲                       │  Supabase JS SDK
        │   │ HTTP/SSR/CSR          │
        │   └───────────────────────┤
        │                           │
┌───────┴────────┐          ┌───────┴─────────┐
│ Next.js pages  │  SELECT  │  Supabase DB    │
│  (Dashboard)   │◄────────▶│  (Postgres)     │
└────────────────┘          └─────────────────┘
```

### Option B: Supabase-only (RECOMMENDED)
```
 ┌───────────────┐   HTTPS     ┌─────────────────┐
 │  Browser /    │────────────►│  Supabase       │
 │  Static Site  │  REST/WS    │  Auto-generated │
 └───────────────┘             │  API + Auth     │
        ▲                      └─────────────────┘
        │                               │
        │ Static Assets                 │ SQL
        │                               ▼
┌───────┴────────┐              ┌─────────────────┐
│ CDN / GitHub   │              │  Postgres DB   │
│ Pages / Netlify│              │  + RLS Policies │
└────────────────┘              └─────────────────┘
```

**Option A:** Next.js pages + custom API routes + Supabase as database
**Option B:** Static frontend + Supabase auto-generated APIs (simpler, fewer moving parts)

## 4  Data Model (initial)
```sql
create table sleep_record (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  record_date date not null,
  time_got_into_bed time,
  time_tried_to_sleep time,
  time_to_fall_asleep_mins int,
  total_awake_time_mins int,
  final_awakening_time time,
  time_in_bed_after_final_awakening_mins int,
  quality_rating text,
  notes text,
  inserted_at timestamptz default now()
);
```
* Add indexes on `(user_id, record_date)` for fast look-ups.
* Supabase Row-Level Security (RLS): `user_id = auth.uid()` so each user only sees their own data.

## 5  User Stories & Implementation

### With Custom API (Option A)
| Story | Endpoint | Notes |
|-------|----------|-------|
| As a user I record a night | `POST /api/sleep` | Body = JSON matching SleepRecord; API inserts row with `user_id` from session. |
| I view the dashboard | `GET /api/stats?range=30d` | API returns aggregated data (or raw rows) for charts. |
| I export all data | `GET /api/export.csv` | Streams CSV from Postgres. |

### With Supabase-only (Option B - RECOMMENDED)
| Story | Implementation | Notes |
|-------|----------------|-------|
| As a user I record a night | `supabase.from('sleep_record').insert({...})` | Direct client call; RLS ensures user can only insert their own data |
| I view the dashboard | `supabase.from('sleep_record').select('*').gte('record_date', '2025-01-01')` | Client-side filtering; could also use Postgres views for aggregations |
| I export all data | `supabase.from('sleep_record').select('*').csv()` | Built-in CSV export via Supabase REST API |
| Real-time updates | `supabase.channel('sleep_record').on('postgres_changes', ...)` | Live dashboard updates when new records added |

## 6  Authentication
* Supabase Auth with email magic-link (simplest) or OAuth (GitHub/Google).
* Next.js edge middleware protects `/dashboard` routes; unauthenticated users redirect to `/login`.

## 7  Deployment Plan

### Option A: Next.js + Custom API
1. `npx create-next-app@latest sleep-dashboard --ts --app`  
2. `npm install @supabase/supabase-js`  
3. Create project in Supabase → copy `SUPABASE_URL` & `SUPABASE_ANON_KEY` to `.env.local`.  
4. Scaffold API routes: `/app/api/sleep/route.ts`, `/app/api/stats/route.ts`.  
5. Port existing Chart.js components into React components.  
6. `git push` to GitHub → Vercel import → automatic deploy.

### Option B: Supabase-only (RECOMMENDED)
1. Create Supabase project → set up schema + RLS policies
2. Choose frontend framework:
   - **React/Vite**: `npm create vite@latest sleep-dashboard -- --template react-ts`
   - **Keep existing**: Port current HTML/CSS/JS to use Supabase client instead of JSON files
   - **Vue/Svelte**: Similar setup with respective CLIs
3. `npm install @supabase/supabase-js`
4. Replace current data loading with Supabase calls
5. Add Supabase Auth UI components
6. Deploy to Netlify/Vercel/GitHub Pages (static hosting)
7. **No server needed** - everything runs client-side + Supabase

## 8  Migration Path
* Write `scripts/import-legacy.ts` that:
  1. Reads `static/sleep_data.json`.
  2. Maps fields → DB schema.
  3. Batch inserts via Supabase client.

## 9  Roadmap
1. MVP (local form + dashboard on Vercel).  
2. Add PWA install + offline queue (IndexedDB → API sync).  
3. Cron job / edge function to compute weekly summaries.  
4. Shareable public link (read-only) with token param.  
5. Optional: mobile app shell with Expo / React Native if you ever need native sensors.

---
*Prepared 26 Jun 2025 – export-consensus project*
