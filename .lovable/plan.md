
# KITARA Security Architecture Restructuring Plan

## Executive Summary

This plan restructures the KITARA application from a frontend-direct database access architecture to a fully secured RPC/Edge Function-based architecture. No visual/layout changes will be made. All data access will be mediated through secure backend functions.

---

## PHASE 1: Secure Database Schema

### 1.1 New Tables to Create

| Table | Purpose |
|-------|---------|
| `user_profiles` | Extended user data (replaces direct profiles access) |
| `invites` | Invite code system for controlled registration |
| `elixir_coupons` | Discount coupon system |
| `tickets` | Event ticket definitions |
| `orders` | User purchases linked to tickets |
| `payments` | Payment records from gateway webhooks |
| `transactions_ledger` | Immutable financial transaction log |
| `audit_logs` | Immutable security/action audit trail |
| `security_events` | Login attempts, MFA events, suspicious activity |

### 1.2 Table Schemas

```text
┌─────────────────────────────────────────────────────────────────┐
│ user_profiles                                                    │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK, FK auth.users)                                     │
│ email (text)                                                     │
│ display_name (text)                                              │
│ invite_code_used (text, FK invites)                              │
│ mfa_enabled (boolean, default false)                             │
│ mfa_secret_encrypted (text)                                      │
│ created_at (timestamptz)                                         │
│ updated_at (timestamptz)                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ invites                                                          │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                    │
│ code (text, UNIQUE)                                              │
│ created_by (uuid, FK auth.users)                                 │
│ max_uses (integer, default 1)                                    │
│ uses_count (integer, default 0)                                  │
│ expires_at (timestamptz)                                         │
│ is_active (boolean, default true)                                │
│ created_at (timestamptz)                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ elixir_coupons                                                   │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                    │
│ code (text, UNIQUE)                                              │
│ discount_percent (integer, 0-100)                                │
│ discount_fixed (numeric)                                         │
│ max_uses (integer)                                               │
│ uses_count (integer, default 0)                                  │
│ valid_from (timestamptz)                                         │
│ valid_until (timestamptz)                                        │
│ is_active (boolean, default true)                                │
│ created_at (timestamptz)                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ tickets                                                          │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                    │
│ name (text)                                                      │
│ description (text)                                               │
│ price (numeric)                                                  │
│ stock (integer)                                                  │
│ event_date (timestamptz)                                         │
│ is_active (boolean, default true)                                │
│ created_at (timestamptz)                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ orders                                                           │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                    │
│ user_id (uuid, FK auth.users)                                    │
│ ticket_id (uuid, FK tickets)                                     │
│ quantity (integer, default 1)                                    │
│ original_price (numeric)                                         │
│ discount_applied (numeric, default 0)                            │
│ final_price (numeric)                                            │
│ elixir_code_used (text)                                          │
│ status (text: 'pending','paid','cancelled','refunded')           │
│ created_at (timestamptz)                                         │
│ paid_at (timestamptz)                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ payments                                                         │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                    │
│ order_id (uuid, FK orders)                                       │
│ gateway (text: 'stripe','pix','manual')                          │
│ gateway_event_id (text, UNIQUE)  -- idempotency key              │
│ gateway_payload (jsonb)                                          │
│ amount (numeric)                                                 │
│ status (text: 'pending','success','failed')                      │
│ processed_at (timestamptz)                                       │
│ created_at (timestamptz)                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ transactions_ledger (APPEND-ONLY)                                │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                    │
│ order_id (uuid, FK orders)                                       │
│ payment_id (uuid, FK payments)                                   │
│ user_id (uuid, FK auth.users)                                    │
│ type (text: 'credit','debit','refund')                           │
│ amount (numeric)                                                 │
│ balance_after (numeric)                                          │
│ description (text)                                               │
│ created_at (timestamptz, default now())                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ audit_logs (IMMUTABLE)                                           │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                    │
│ user_id (uuid)                                                   │
│ action (text)                                                    │
│ entity_type (text)                                               │
│ entity_id (uuid)                                                 │
│ old_data (jsonb)                                                 │
│ new_data (jsonb)                                                 │
│ ip_address (text)                                                │
│ user_agent (text)                                                │
│ created_at (timestamptz, default now())                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ security_events                                                  │
├─────────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                                    │
│ user_id (uuid)                                                   │
│ event_type (text: 'login','logout','mfa_setup','mfa_verify')     │
│ success (boolean)                                                │
│ ip_address (text)                                                │
│ user_agent (text)                                                │
│ metadata (jsonb)                                                 │
│ created_at (timestamptz, default now())                          │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 RLS Policies (Minimal Direct Access)

All sensitive tables will have RLS enabled with NO direct INSERT/UPDATE/DELETE policies for regular users. Only SECURITY DEFINER functions can modify data.

```text
Tables with NO direct write access:
- orders (via RPC only)
- payments (via Edge Function webhook only)
- transactions_ledger (append via RPC only)
- audit_logs (append via RPC only)
- security_events (append via RPC only)
- elixir_coupons (admin RPC only)
- invites (admin RPC only)
```

---

## PHASE 2: RPC Functions (SECURITY DEFINER)

### 2.1 Required RPCs

| RPC Name | Purpose | Access |
|----------|---------|--------|
| `validate_invite(code)` | Check if invite code is valid/available | Public |
| `consume_invite(code, user_id)` | Mark invite as used during signup | Auth |
| `apply_elixir(code)` | Validate and return discount info | Auth |
| `create_order(ticket_id, elixir_code)` | Create order with calculated discount | Auth |
| `finalize_order_from_webhook(order_id, gateway_data)` | Process payment confirmation | Service Role |
| `get_my_profile()` | Get current user's profile | Auth |
| `get_my_tickets()` | Get current user's purchased tickets | Auth |
| `admin_get_stats()` | Get dashboard statistics | Admin |
| `admin_create_ticket(name, desc, price, stock)` | Create new ticket | Admin |
| `admin_create_coupon(code, discount, max_uses)` | Create elixir coupon | Admin |
| `admin_create_invite(max_uses, expires_at)` | Generate invite code | Admin |
| `log_security_event(type, success, metadata)` | Record security events | Auth |
| `setup_mfa(secret_encrypted)` | Enable MFA for user | Auth |
| `verify_mfa_setup(token)` | Verify MFA during setup | Auth |

### 2.2 RPC Implementation Pattern

```sql
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', up.id,
    'email', up.email,
    'display_name', up.display_name,
    'mfa_enabled', up.mfa_enabled,
    'role', ur.role,
    'created_at', up.created_at
  )
  INTO result
  FROM user_profiles up
  LEFT JOIN user_roles ur ON ur.user_id = up.id
  WHERE up.id = auth.uid();
  
  RETURN result;
END;
$$;
```

---

## PHASE 3: Edge Functions

### 3.1 Edge Functions to Create

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `process-payment` | POST /process-payment | Webhook receiver for payment gateway |
| `reconcile-payments` | POST /reconcile-payments | Scheduled job for payment reconciliation |
| `create-support-session` | POST /create-support-session | Generate temporary support session ID |

### 3.2 process-payment Edge Function

```text
Flow:
1. Validate webhook signature (Stripe/Gateway specific)
2. Parse gateway_event_id for idempotency
3. Check if gateway_event_id already processed in payments table
4. If new: call RPC finalize_order_from_webhook()
5. Log to audit_logs
6. Return 200 OK
```

### 3.3 create-support-session Edge Function

```text
Flow:
1. Verify authenticated user
2. Generate unique support_session_id (UUID + timestamp)
3. Store in temporary sessions table with 24h TTL
4. Return WhatsApp deep link with pre-filled message
```

---

## PHASE 4: Secure Authentication Flow

### 4.1 New Auth Flow Components

```text
Current Flow:
  /auth → email/password → dashboard

New Flow:
  /auth → [Step 1: Invite Code]
       → [Step 2: Email/Password Registration]
       → [Step 3: MFA Setup (TOTP)]
       → dashboard

Returning User:
  /auth → email/password → MFA verify → dashboard
```

### 4.2 New Hook: useSecureAuth

Replace `useAuth` with `useSecureAuth` that:
- Uses RPC `get_my_profile()` instead of direct table access
- Enforces MFA verification before dashboard access
- Logs all auth events via `log_security_event()` RPC

### 4.3 New Auth Page Flow

Create multi-step auth with:
- `InviteCodeStep` - Validates invite via RPC
- `SignUpStep` - Strong password validation, email signup
- `MFASetupStep` - TOTP setup (reuse existing TwoFactorSetup)
- `MFAVerifyStep` - TOTP verification on login

---

## PHASE 5: Checkout with Elixir Code

### 5.1 Checkout Flow

```text
1. User selects ticket
2. Optional: Enter "Elixir Code" (discount)
3. Frontend calls RPC apply_elixir(code)
   → Returns: { valid, discount_percent, discount_fixed, message }
4. Frontend calls RPC create_order(ticket_id, elixir_code)
   → Returns: { order_id, final_price, payment_url }
5. Redirect to payment gateway
6. Gateway webhook → Edge Function process-payment
7. Edge Function → RPC finalize_order_from_webhook()
8. User sees "Payment Confirmed" on return
```

### 5.2 Elixir Code UI

Add optional input field in checkout:
- Label: "Discount Code (Elixir)"
- Button: "Apply"
- Shows discount amount or error message

---

## PHASE 6: Admin Dashboard Restructure

### 6.1 Remove All supabase.from() Calls

Current components using direct access:
- `AdminTab.tsx` - uses supabase.from() for stats
- `ProductsTab.tsx` - uses supabase.from('products')
- `UserManagementTab.tsx` - uses supabase.from('profiles')
- `CreateUserDialog.tsx` - uses supabase.from() for inserts

### 6.2 Replace with RPC Calls

```typescript
// Before
const { data } = await supabase.from('profiles').select('*');

// After
const { data } = await supabase.rpc('admin_get_stats');
```

### 6.3 Admin Capabilities via RPC

| Action | RPC |
|--------|-----|
| View stats | `admin_get_stats()` |
| Create ticket | `admin_create_ticket()` |
| Create coupon | `admin_create_coupon()` |
| Create invite | `admin_create_invite()` |
| View users | `admin_get_users()` |
| Promote user | `admin_set_user_role()` |

---

## PHASE 7: WhatsApp Support Button

### 7.1 Implementation

```text
Fixed Button (bottom-right):
  Icon: WhatsApp
  Position: fixed, z-50

On Click:
  1. Call Edge Function create-support-session
  2. Receive: { session_id, whatsapp_url }
  3. Open: whatsapp://send?phone=SUPPORT_NUMBER&text=...
```

### 7.2 Message Template

```text
Olá! Preciso de suporte.
Session ID: {support_session_id}
Email: {user_email}
```

---

## Technical Implementation Details

### Files to Create

| Path | Description |
|------|-------------|
| `supabase/migrations/xxx_secure_schema.sql` | Complete schema migration |
| `supabase/functions/process-payment/index.ts` | Payment webhook handler |
| `supabase/functions/reconcile-payments/index.ts` | Reconciliation job |
| `supabase/functions/create-support-session/index.ts` | Support session generator |
| `src/hooks/useSecureAuth.ts` | New secure auth hook |
| `src/components/auth/InviteCodeStep.tsx` | Invite code validation |
| `src/components/auth/SignUpStep.tsx` | Registration with strong password |
| `src/components/auth/MFASetupStep.tsx` | TOTP setup wrapper |
| `src/components/auth/MFAVerifyStep.tsx` | TOTP verification |
| `src/components/checkout/ElixirCodeInput.tsx` | Discount code input |
| `src/components/support/WhatsAppButton.tsx` | Fixed support button |
| `src/lib/api.ts` | RPC wrapper functions |

### Files to Modify

| Path | Changes |
|------|---------|
| `src/pages/Auth.tsx` | Multi-step auth flow |
| `src/pages/Dashboard.tsx` | Use new auth hook, add support button |
| `src/components/dashboard/AdminTab.tsx` | Replace direct access with RPCs |
| `src/components/dashboard/ProductsTab.tsx` | Use RPC for products |
| `src/components/dashboard/UserManagementTab.tsx` | Use RPC for users |
| `src/components/dashboard/CreateUserDialog.tsx` | Use RPC for user creation |
| `src/lib/security.ts` | Update TOTP issuer to KITARA |
| `public/icons/*` | Copy uploaded KITARA logo |

### Files to Delete/Deprecate

| Path | Reason |
|------|--------|
| `src/hooks/useAuth.ts` | Replaced by useSecureAuth |
| `src/hooks/useFakeAuth.ts` | No longer needed |

---

## Migration Order

1. **Database Migration** - Create new tables, RPCs, RLS policies
2. **Edge Functions** - Deploy process-payment, reconcile-payments, create-support-session
3. **API Layer** - Create `src/lib/api.ts` with RPC wrappers
4. **Auth Refactor** - Implement useSecureAuth and multi-step auth
5. **Admin Refactor** - Replace all supabase.from() with RPC calls
6. **Checkout Flow** - Implement Elixir code and order creation
7. **Support Button** - Add WhatsApp support integration
8. **Logo Update** - Copy uploaded KITARA logo to project icons

---

## Security Guarantees After Implementation

| Guarantee | Enforcement |
|-----------|-------------|
| No direct table writes from frontend | RLS denies all INSERT/UPDATE/DELETE |
| Payment status only via webhook | Only Edge Function can mark orders as paid |
| Immutable audit trail | No UPDATE/DELETE on audit_logs |
| MFA required | Auth hook blocks dashboard without MFA |
| Invite-only registration | validate_invite() required before signup |
| Rate limiting | RPC functions track attempts in security_events |
