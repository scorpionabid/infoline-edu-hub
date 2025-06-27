# İnfoLine Auth System - Təkmilləşdirmə Planı v2.0

## 📊 Database Analizi (Real Data)

### User Roles Distribution
```
superadmin:    1 user  (0 regions, 0 sectors, 0 schools)
regionadmin:   9 users (1 region,  0 sectors, 0 schools)  
sectoradmin:   5 users (1 region,  5 sectors, 0 schools)
schooladmin: 352 users (1 region,  6 sectors, 352 schools)
```

### Kritik Müşahidələr
1. **SuperAdmin**: `d056c1f9-3df2-4483-9106-c6853c3ce765` - NULL region/sector/school
2. **RegionAdmin**: Hamısı eyni region-a təyin olunub (`60230000-7641-499d-b9a4-1ab1eb87eecc`)  
3. **SectorAdmin**: 5 fərqli sektora aid
4. **SchoolAdmin**: 352 müxtəlif məktəbə aid

## 🚨 Auth Sistemində Aşkar Edilən Problemlər

### 1. **Email-Based Role Override Bug**
🔴 **CRITICAL**: `useAuthStore.ts`-də hardcoded superadmin logic

```typescript
// PROBLEM: Line 42-46
const isKnownSuperAdmin = data.user.email?.toLowerCase() === 'superadmin@infoline.az';
const userRole = isKnownSuperAdmin ? 'superadmin' : (profile.user_roles?.role || 'user');
```

**Nəticə**: Database role-ları override edilir, yanlış permissions verilir.

### 2. **Inconsistent Role Fallback**
🔴 **CRITICAL**: Fərqli fallback strategiyaları

```typescript
// Line 46: Default 'user' 
const userRole = isKnownSuperAdmin ? 'superadmin' : (profile.user_roles?.role || 'user');

// Line 139: Default 'schooladmin'
const userRole = profile.user_roles?.role || 'schooladmin';
```

### 3. **Permission System Təkrarçılığı**
🟡 **MEDIUM**: 
- `usePermissions.ts` (500+ lines) - mega fayl
- `useAuthStore.ts`-də `hasPermission` method
- Multiple permission checking approaches

### 4. **Data Type Inconsistency**
🟡 **MEDIUM**: `types/auth.ts` və `types/user.ts` arasında duplikat və qarışıq tiplər

## 🎯 Təkmilləşdirmə Strategiyası

### **Faza 1: Kritik Xətaların Həlli (1-2 gün)**

#### A. Email-Based Override Removal
```typescript
// useAuthStore.ts - signIn method
// ❌ REMOVE:
const isKnownSuperAdmin = data.user.email?.toLowerCase() === 'superadmin@infoline.az';
const userRole = isKnownSuperAdmin ? 'superadmin' : (profile.user_roles?.role || 'user');

// ✅ REPLACE WITH:
const userRole = profile.user_roles?.role || 'schooladmin';
```

#### B. Consistent Role Fallback
```typescript
// Standard fallback across all functions
const DEFAULT_ROLE = 'schooladmin';
const userRole = profile.user_roles?.role || DEFAULT_ROLE;
```

#### C. Enhanced Role Debugging
```typescript
console.group('🔑 [Auth] Role Detection Details');
console.log('User ID:', data.user.id);
console.log('Email:', data.user.email);
console.log('DB Role:', profile.user_roles?.role);
console.log('Final Role:', userRole);
console.log('Region ID:', profile.user_roles?.region_id);
console.log('Sector ID:', profile.user_roles?.sector_id);
console.log('School ID:', profile.user_roles?.school_id);
console.groupEnd();
```

### **Faza 2: Database Connection Optimization (2-3 gün)**

#### A. RLS Policy Integration
```typescript
// Auth prosesində database role verification
const verifyRoleWithRLS = async (userId: string): Promise<UserRole> => {
  const { data, error } = await supabase.rpc('get_user_role', {
    user_id_param: userId
  });
  
  if (error) {
    console.error('❌ [Auth] RLS role verification failed:', error);
    return 'schooladmin'; // Safe fallback
  }
  
  return data || 'schooladmin';
};
```

#### B. Session Role Consistency Check
```typescript
// initializeAuth method-da əlavə yoxlama
const dbRole = await verifyRoleWithRLS(session.user.id);
const profileRole = profile.user_roles?.role;

if (dbRole !== profileRole) {
  console.warn('⚠️ [Auth] Role inconsistency detected:', {
    dbRole,
    profileRole,
    userId: session.user.id
  });
  
  // Use RLS result as authoritative
  userRole = dbRole;
}
```

#### C. Role-Based Data Access Validation
```typescript
// Login sonrası role-based access test
const validateRoleAccess = async (userRole: UserRole, userId: string) => {
  switch (userRole) {
    case 'superadmin':
      // Test all access
      break;
    case 'regionadmin':
      // Test region access
      const { data: regions } = await supabase.from('regions').select('id').limit(1);
      if (!regions?.length) {
        throw new Error('RegionAdmin cannot access regions');
      }
      break;
    case 'sectoradmin':
      // Test sector access
      break;
    case 'schooladmin':
      // Test school access
      break;
  }
};
```

### **Faza 3: Permission System Refactor (3-4 gün)**

#### A. Permission Hook Simplification
```typescript
// Simplified permission hook
export const usePermissions = (): UsePermissionsResult => {
  const { user } = useAuthStore();
  
  // Basic role checkers
  const isSuperAdmin = user?.role === 'superadmin';
  const isRegionAdmin = user?.role === 'regionadmin';
  const isSectorAdmin = user?.role === 'sectoradmin';
  const isSchoolAdmin = user?.role === 'schooladmin';
  
  // Role hierarchy check
  const hasRoleAtLeast = (minRole: UserRole) => {
    const hierarchy = ['schooladmin', 'sectoradmin', 'regionadmin', 'superadmin'];
    const userIndex = hierarchy.indexOf(user?.role || 'schooladmin');
    const minIndex = hierarchy.indexOf(minRole);
    return userIndex >= minIndex;
  };
  
  // Permission derivations
  const canManageUsers = hasRoleAtLeast('regionadmin');
  const canManageSchools = hasRoleAtLeast('sectoradmin');
  const canManageData = hasRoleAtLeast('schooladmin');
  
  return {
    isSuperAdmin,
    isRegionAdmin,
    isSectorAdmin,
    isSchoolAdmin,
    hasRoleAtLeast,
    canManageUsers,
    canManageSchools,
    canManageData,
    userRole: user?.role,
    regionId: user?.region_id,
    sectorId: user?.sector_id,
    schoolId: user?.school_id
  };
};
```

#### B. Database Permission Verification
```typescript
// Server-side permission verification
export const verifyPermission = async (action: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('check_user_permission', {
    action_param: action
  });
  
  if (error) {
    console.error('Permission check failed:', error);
    return false;
  }
  
  return data || false;
};
```

#### C. Remove Deprecated Permission Functions
```typescript
// DELETE from usePermissions.ts:
- checkRegionAccess()
- checkSectorAccess()  
- checkSchoolAccess()
- checkIsSuperAdmin()
- checkIsRegionAdmin()
- checkIsSectorAdmin()

// REPLACE WITH: Direct RLS policy calls
```

### **Faza 4: Type System Consolidation (1-2 gün)**

#### A. Unified Auth Types
```typescript
// types/auth.ts - Master file
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

// Legacy aliases
export type { UserData as FullUserData };
export type { UserData as User };
```

#### B. Clean User Types
```typescript
// types/user.ts - Minimal re-exports
export type { UserData, UserRole } from './auth';
export type { UserData as User } from './auth';

export interface UserFormData {
  email: string;
  full_name: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
}
```

### **Faza 5: Testing