

# KITARA Production Fintech Mode - Complete Fix Plan

## Problem Summary

The build currently fails due to:
1. **Missing import**: `ProductsTab.tsx` calls `applyElixir` without importing it
2. **Missing RPC type definitions**: `get_active_tickets`, `admin_create_user`, `get_my_accesses` are not defined in `types.ts`
3. **next-themes dependency**: Still present and needs complete removal
4. **vercel.json**: Missing manifest.json header configuration

---

## Phase 1: Fix TypeScript Build Errors

### 1.1 Fix ProductsTab.tsx - Missing Import

Add the missing `applyElixir` import from `@/lib/api`:

```typescript
import {
  getActiveTickets,
  createOrder,
  applyElixir,  // ADD THIS
  type Ticket,
  type ElixirValidation,
} from "@/lib/api";
```

### 1.2 Fix api.ts - Remove Unused Functions

The following functions call RPCs that don't exist in the database schema:
- `getActiveTickets()` - Uses `get_active_tickets` RPC (doesn't exist)
- `adminCreateUser()` - Uses `admin_create_user` RPC (doesn't exist)
- `getMyAccesses()` - Uses `get_my_accesses` RPC (doesn't exist)

**Solution**: Replace these with functions that use existing RPCs or direct RLS-protected queries.

For `getActiveTickets()`: The tickets table has RLS policy "Anyone can read active tickets" that allows SELECT where `is_active = true`. Use `supabase.from('tickets')` with proper typing since this is a read-only operation on a public-readable table.

For `adminCreateUser()` and `getMyAccesses()`: Remove these functions as they're not used or add corresponding RPCs to the migration.

### 1.3 Update Supabase Types

Add missing RPC definitions to `types.ts`:
- `get_active_tickets` (or use table query since RLS allows it)

---

## Phase 2: Remove next-themes Dependency

### 2.1 Files to Modify

| File | Changes |
|------|---------|
| `package.json` | Remove `next-themes` from dependencies |
| `src/App.tsx` | Remove `ThemeProvider` import and wrapper |
| `src/components/ui/sonner.tsx` | Replace `useTheme` with localStorage-based theme |

### 2.2 Create Theme Hook (Replacement)

Create a simple theme hook that uses localStorage:

```typescript
// src/hooks/useLocalTheme.ts
export const useLocalTheme = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('theme');
    return (stored as 'dark' | 'light') || 'dark';
  });
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  return { theme, setTheme };
};
```

### 2.3 Update App.tsx

Remove ThemeProvider wrapper:

```typescript
// Before
import { ThemeProvider } from "next-themes";
// ...
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  ...
</ThemeProvider>

// After
// Remove ThemeProvider entirely, add useEffect for theme
useEffect(() => {
  document.documentElement.classList.add('dark');
}, []);
```

### 2.4 Update sonner.tsx

Replace next-themes usage with static dark theme:

```typescript
// Before
import { useTheme } from "next-themes"
const { theme = "system" } = useTheme()

// After
const theme = "dark"  // KITARA is always dark theme
```

---

## Phase 3: Fix vercel.json

Update to include manifest.json headers:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/manifest.json",
      "headers": [
        { "key": "Content-Type", "value": "application/manifest+json" }
      ]
    }
  ]
}
```

---

## Phase 4: Verify Zero supabase.from() in Frontend

### Current State

Search shows only comment references to `supabase.from()` (explaining what NOT to do).

### Action Required

Verify `getActiveTickets()` - this is the only function that may need adjustment. Options:

**Option A**: Create a new RPC `get_active_tickets` via migration (preferred for security model consistency)

**Option B**: Use `supabase.from('tickets').select().eq('is_active', true)` since tickets table has public read RLS policy

Recommendation: **Option A** - Add the RPC to maintain zero-direct-access architecture.

---

## Phase 5: Add Missing RPC (get_active_tickets)

Create migration to add the missing RPC:

```sql
CREATE OR REPLACE FUNCTION public.get_active_tickets()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', id,
        'name', name,
        'description', description,
        'price', price,
        'stock', stock,
        'event_date', event_date,
        'is_active', is_active,
        'created_at', created_at
      )
    ), '[]'::jsonb)
    FROM public.tickets
    WHERE is_active = true AND stock > 0
    ORDER BY created_at DESC
  );
END;
$$;
```

---

## Files to Modify Summary

| File | Action |
|------|--------|
| `src/components/dashboard/ProductsTab.tsx` | Add `applyElixir` import |
| `src/lib/api.ts` | Remove unused functions, fix type casting |
| `src/integrations/supabase/types.ts` | Add `get_active_tickets` RPC type |
| `package.json` | Remove `next-themes` dependency |
| `src/App.tsx` | Remove ThemeProvider, add dark theme useEffect |
| `src/components/ui/sonner.tsx` | Replace useTheme with static dark theme |
| `vercel.json` | Add manifest.json headers |
| `supabase/migrations/xxx_add_get_active_tickets.sql` | Add missing RPC |

---

## Expected Outcome After Implementation

1. **Build passes** - All TypeScript errors resolved
2. **Zero supabase.from()** - All data access via RPC or Edge Functions
3. **No next-themes** - Theme controlled via localStorage/CSS
4. **Vercel ready** - Proper configuration for deployment
5. **Complete security model** - Fintech-grade architecture maintained

