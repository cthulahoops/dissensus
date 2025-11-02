# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend Development
All frontend commands should be run from the `frontend/` directory:

```bash
cd frontend

# Development server (runs on http://localhost:5173)
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Combined check (type checking + linting)
npm run check

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Format code
npm run format

# Generate TypeScript types from Supabase schema
npm run generate-types
```

### Python Utilities
Python scripts use `uv` for dependency management. Run from the project root:

```bash
# Import sleep data from JSON
uv run supabase/import_data.py <path-to-json> [--email user@example.com] [--batch-size 50]

# Create a new user account
uv run supabase/create_user.py

# Update user email
uv run supabase/update_user_email.py

# Export sleep data
uv run export_sleep_data.py
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **State Management**: TanStack Query (React Query) for server state
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Charting**: Chart.js with react-chartjs-2
- **Styling**: Custom CSS with mobile-first responsive design

### Project Structure

```
dissensus/
├── frontend/               # React TypeScript application
│   ├── src/
│   │   ├── components/     # React components (Dashboard, Forms, Charts)
│   │   ├── pages/          # Top-level page components
│   │   ├── hooks/          # Custom React hooks (useAuth, useSleepData, etc.)
│   │   ├── lib/            # Utilities and API clients
│   │   │   ├── supabase.ts        # Supabase client and API functions
│   │   │   ├── sleepUtils.ts      # Sleep data processing and calculations
│   │   │   └── shareUtils.ts      # Share link utilities
│   │   ├── database.types.ts      # Auto-generated Supabase types
│   │   ├── App.tsx         # Top-level app with QueryClient provider
│   │   ├── Router.tsx      # Custom routing logic
│   │   └── main.tsx        # Entry point
│   └── package.json
├── supabase/              # Database configuration and utilities
│   ├── schema.sql         # Database schema with RLS policies
│   ├── migrations/        # SQL migration files
│   └── *.py              # Python utilities for data management
└── pyproject.toml         # Python dependencies
```

### Key Architecture Patterns

#### Custom Router
The application uses a **custom routing system** (not React Router) implemented in `Router.tsx` and `hooks/useAppRouter.ts`. Navigation is handled via:
- `setAppView()` to change views
- `window.history.pushState()` for browser history
- State-based view rendering

Views include: `login`, `dashboard`, `add-record`, `share-manager`, `workout-dashboard`, `scan-qr`, `shared-dashboard`, `auth-callback`.

#### Data Layer Architecture
The app uses **TanStack Query** for all server state management:
1. **API Functions** (`lib/supabase.ts`): Type-safe Supabase operations using auto-generated types from `database.types.ts`
2. **Custom Hooks** (`hooks/useSleepData.ts`, etc.): Wrap API calls with useQuery/useMutation
3. **Components**: Use custom hooks for data access, no direct Supabase calls

Example pattern:
```typescript
// lib/supabase.ts - API layer
export const sleepRecordsAPI = {
  async getAll(userId: string): Promise<SleepRecord[]> { ... }
};

// hooks/useSleepData.ts - React Query integration
export function useSleepData(user: User) {
  return useQuery({
    queryKey: ['sleepRecords', user.id],
    queryFn: () => sleepRecordsAPI.getAll(user.id)
  });
}

// Component usage
const { records, loading, error } = useSleepData(user);
```

#### Authentication Flow
- Supabase Auth with email/password
- `useAuth` hook manages authentication state
- RLS policies enforce data isolation per user
- Session managed via Supabase client

#### Sharing System
Time-limited share links for sleep data:
1. User creates share link → generates token in `public_shares` table
2. Share URL contains token: `/?share=<token>`
3. Anonymous users can access via RLS policy that validates token and expiration
4. `SharedDashboardPage` uses `useSharedData` hook to fetch data without authentication

#### Data Processing Pipeline
Sleep data processing in `lib/sleepUtils.ts`:
1. Raw `SleepRecord[]` from database
2. `processData()` → calculates derived metrics (total sleep time, sleep efficiency, etc.)
3. `filterRecordsByDateRange()` → filters to selected time range
4. `getAveragedData()` → calculates rolling averages for trend analysis
5. Components receive processed data for visualization

### Database Schema

#### `sleep_records` Table
Core sleep tracking table with RLS policies:
- Basic: `date`, `user_id`, `comments`
- Timing: `time_got_into_bed`, `time_tried_to_sleep`, `time_to_fall_asleep_mins`, `final_awakening_time`, `time_got_out_of_bed`
- Quality: `times_woke_up_count`, `total_awake_time_mins`, `sleep_quality_rating`
- Unique constraint: `(user_id, date)`

#### `public_shares` Table
Share link management:
- `share_token`: Unique token for sharing
- `user_id`: Owner of the data
- `expires_at`: Token expiration timestamp

#### `workouts` Table
Halo Fitness QR code workout tracking:
- Stores workout metrics and raw JSON data
- Similar RLS policies to sleep_records

### Type Safety
The project uses **auto-generated TypeScript types** from the Supabase schema:
- Run `npm run generate-types` to regenerate `database.types.ts`
- Type helpers in `lib/supabase.ts`: `Selectable<T>`, `Insertable<T>`, `Updateable<T>`
- All database operations are fully type-safe

### Testing
- Vitest configured for unit tests
- Test files use `.test.ts` extension
- Example: `lib/sleepUtils.test.ts`

## Important Development Notes

- **No React Router**: The app uses custom routing. To navigate, use `setAppView()` from `useAppRouter()`.
- **TanStack Query for all data**: Never call Supabase directly from components. Use or create custom hooks.
- **Regenerate types after schema changes**: Run `npm run generate-types` when modifying database schema.
- **RLS is enforced**: All database operations respect Row Level Security. Use service key only in Python scripts for admin operations.
- **Mobile-first CSS**: All styling is custom CSS designed for mobile devices first, then enhanced for desktop.
- **CSS Philosophy**: When writing or reviewing CSS, always consult `frontend/CSS_PHILOSOPHY.md` for our radical simplification approach. Question everything, delete ruthlessly, consolidate aggressively.
