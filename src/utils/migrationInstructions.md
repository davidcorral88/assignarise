
# Role Migration Instructions

## Background
The application previously used the role 'manager', which has been renamed to 'director' in the `UserRole` type definition. This change requires updates across multiple files to ensure type consistency.

## Files to Update
The following files have been updated to replace 'manager' role checks with 'director':

1. ✅ src/components/auth/AuthContext.tsx
2. ✅ src/components/layout/Header.tsx
3. ✅ src/pages/Calendars.tsx
4. ✅ src/pages/Dashboard.tsx
5. ✅ src/pages/TaskDetail.tsx
6. ✅ src/pages/TaskForm.tsx
7. ✅ src/pages/TaskList.tsx
8. ✅ src/pages/UserConfig.tsx
9. ✅ src/pages/WorkScheduleConfig.tsx

## Changes Made
In each file, all role comparisons like:
```typescript
currentUser?.role === 'manager'
```

Were replaced with:
```typescript
currentUser?.role === 'director'
```

All UI text references to 'Xerente' were changed to 'Director'.

## Migration Complete
The migration has been completed and all TypeScript errors related to comparing the UserRole type with the 'manager' string literal have been resolved.
