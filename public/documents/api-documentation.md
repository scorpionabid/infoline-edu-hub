
# API Documentation for InfoLine Project

## Authentication and Authorization

### User Roles and Permissions

The InfoLine system uses a role-based access control (RBAC) system with the following roles:

- **superadmin**: Has full access to all features and data
- **regionadmin**: Can manage sectors, schools, categories, columns, and users within their assigned region
- **sectoradmin**: Can manage schools and users within their assigned sector
- **schooladmin**: Can enter data for their assigned school

### User Authentication Flow

The authentication system uses Supabase Auth for user management. The flow is as follows:

1. User logs in with email and password via `supabase.auth.signInWithPassword()`
2. Upon successful authentication, the system fetches:
   - User profile from the `profiles` table
   - User role from the `user_roles` table
3. The combined data is stored in the auth store and used throughout the application

### Permissions System

Permissions are determined by:

1. The user's role (superadmin, regionadmin, sectoradmin, schooladmin)
2. The user's assigned entities (region_id, sector_id, school_id)

The `usePermissions` hook provides methods to check permissions:

- `hasRole(role)`: Check if user has the specified role
- `canViewRegion(regionId)`: Check if user can access a specific region
- `canViewSector(sectorId)`: Check if user can access a specific sector
- `canViewSchool(schoolId)`: Check if user can access a specific school

Plus convenience flags:
- `canManageUsers`: Can the user manage other users
- `canManageRegions`: Can the user manage regions
- `canManageSectors`: Can the user manage sectors
- `canManageSchools`: Can the user manage schools
- `canManageCategories`: Can the user manage categories
- `canApproveData`: Can the user approve data submissions
- `canEnterData`: Can the user enter data

## Data Models

### User Profile

The `profiles` table contains user information:

```typescript
interface Profile {
  id: string;               // Maps to auth.users.id
  email: string;
  full_name: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending' | 'blocked';
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  notification_settings?: {
    email: boolean;
    push: boolean;
    app?: boolean;
  };
}
```

### User Roles

The `user_roles` table associates users with roles and entities:

```typescript
interface UserRole {
  id: string;
  user_id: string;          // References auth.users.id
  role: 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';
  region_id?: string;       // For regionadmin
  sector_id?: string;       // For sectoradmin
  school_id?: string;       // For schooladmin
  created_at?: string;
  updated_at?: string;
}
```

## Common API Patterns

### Error Handling

All API requests should handle errors using try/catch blocks:

```typescript
try {
  const { data, error } = await supabase.from('table').select('*');
  
  if (error) {
    throw error;
  }
  
  return data;
} catch (error) {
  console.error('Error message:', error);
  // Show toast or other user feedback
  throw error;
}
```

### Role-Based Database Access

All database tables use Row Level Security (RLS) to restrict access based on user role.
Common patterns for access rules:

1. Superadmins can access all records
2. Region admins can access records for their region
3. Sector admins can access records for their sector
4. School admins can access records for their school

## Troubleshooting

### Common Issues

1. **Role Undefined**: If user role is undefined, check:
   - User has a record in the `user_roles` table
   - Auth initialization completes before accessing role

2. **Permission Denied**: If user can't access expected resources:
   - Verify the user's role in the database
   - Check if entity IDs (region_id, sector_id, school_id) are correctly assigned
   - Ensure RLS policies allow the required access

3. **Navigation Items Not Showing**: Role-based navigation items depend on:
   - User having a valid role
   - Auth store being properly initialized
   - Permissions hook correctly identifying user capabilities
