
# Fix Admin Approval Pages Access & Staff Profile Resolution

## Problem Summary

The user cannot access the Lesson Plan Approvals and Scheme of Work Approvals pages. Investigation revealed two distinct issues:

### Issue 1: Missing Staff Record for Approvers
- The user (institution_admin) has correct permissions (`academics:approve`)
- However, no staff record exists for this user in the database
- Both approval pages require `staffProfile?.id` to identify the approver
- When trying to approve, users get "Unable to identify approver" error

### Issue 2: Page Loading Gets Stuck (Potential Race Condition)
- The ProtectedRoute shows a loading spinner indefinitely
- This occurs when `loading || rolesLoading || permissionsLoading || institutionLoading` is true
- The `usePermissions` hook depends on `institutionId` from `useInstitution`
- If the institution context loads slowly or has timing issues, the page stays stuck

## Solution

### Part 1: Allow Approvals Without Staff Record

Modify the approval pages to use user authentication ID as a fallback when no staff profile exists. This allows institution admins who may not have a formal "staff" record to still approve items.

**Files to Modify:**
- `src/pages/LessonPlanApprovals.tsx`
- `src/pages/SchemeApprovals.tsx`

**Changes:**
1. Get `user` from `useAuth()` in addition to `staffProfile`
2. Use `staffProfile?.id ?? user?.id` as the approver identifier
3. Update the error message to only show if BOTH are unavailable

**Before:**
```typescript
const { data: staffProfile } = useStaffProfile();
// ...
if (!staffProfile?.id) {
  toast.error('Unable to identify approver');
  return;
}
await approveMutation.mutateAsync({ id, approverId: staffProfile.id });
```

**After:**
```typescript
const { user } = useAuth();
const { data: staffProfile } = useStaffProfile();
// ...
const approverId = staffProfile?.id ?? user?.id;
if (!approverId) {
  toast.error('Unable to identify approver');
  return;
}
await approveMutation.mutateAsync({ id, approverId });
```

### Part 2: Ensure Robust InstitutionContext Loading

Improve the `InstitutionContext` to prevent stuck loading states when the initial query takes time.

**File to Modify:**
- `src/contexts/InstitutionContext.tsx`

**Changes:**
1. Add explicit handling for when the first query (user-institution-id) is loading vs has loaded with null
2. The `isLoading` state should only be true when actively fetching institution details, not when waiting for `activeInstitutionId`

**Current Issue:**
```typescript
const { data: institution, isLoading, error, refetch } = useQuery({
  // ...
  enabled: !!activeInstitutionId,
});
// When activeInstitutionId is null, isLoading is false but isPending could cause issues
```

**Fix:**
- Track loading states more explicitly
- Ensure we don't return `isLoading: true` indefinitely

### Part 3: Add Defensive Loading Timeout

Add a timeout mechanism to prevent indefinite loading states in ProtectedRoute.

**File to Modify:**
- `src/components/auth/ProtectedRoute.tsx`

**Changes:**
Add a 10-second timeout that forces the loading state to complete and either shows the page or redirects based on available data.

## Database Consideration

The lesson_plans table has an `approved_by` column that references `staff.id`. For institution admins without staff records, using their `auth.users.id` as the approver will fail the foreign key constraint.

**Solution Options:**

**Option A (Recommended):** Auto-create a minimal staff record for institution admins when they first attempt to approve something. This maintains data integrity.

**Option B:** Modify the database to allow `approved_by` to be either a staff ID or user ID (using a nullable FK or separate column). More disruptive.

**Option C:** Modify the FK constraint to reference `auth.users.id` instead. Most disruptive but cleanest long-term.

## Implementation Order

1. **First:** Update `LessonPlanApprovals.tsx` and `SchemeApprovals.tsx` to use the auth user ID as fallback
2. **Second:** Create a helper function that auto-creates a staff record for admins who don't have one
3. **Third:** Add loading timeout to ProtectedRoute to prevent stuck states
4. **Fourth:** Update InstitutionContext for more robust loading state management

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/lib/ensure-staff-profile.ts` | Helper to auto-create staff record for admins |

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/LessonPlanApprovals.tsx` | Use auth user fallback for approver ID |
| `src/pages/SchemeApprovals.tsx` | Use auth user fallback for approver ID |
| `src/hooks/useStaffProfile.ts` | Auto-create staff record if admin has none |
| `src/components/auth/ProtectedRoute.tsx` | Add loading timeout safety |
| `src/contexts/InstitutionContext.tsx` | Improve loading state handling |

### Expected Outcome

After implementation:
- Institution admins without staff records will automatically get one created
- Approval pages will load correctly and allow approvals
- Loading states will have a maximum duration to prevent stuck screens
- The `approved_by` foreign key constraint will be satisfied
