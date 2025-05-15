
# InfoLine Project Guidelines and Standards

## 1. Document Structure and Rules

A standardized approach is used for documents and error handling in this project:

- **Core documents**: Located in the `public/documents/` folder
- **Error documentation**: Located in the `public/document-errors/` folder

When resolving errors, refer to the error documentation and maintain the same standards.

## 2. Code Duplication and Redundancy

### 2.1 Duplicate Files Issues

The project often contains components, functions, or pages that perform identical or very similar tasks. Such duplications hinder code maintenance and ongoing development.

### Duplication Resolution Strategy:

1. **File search**:
   - Before creating a new file, search for similarly named files in the `src` directory
   - Particularly check `components/`, `hooks/`, `pages/`, and `context/` folders

2. **File cleanup process**:
   - Keep the more functional and complete version of duplicate files
   - Remove the other file(s)
   - Redirect references from the removed files to the retained file

3. **Using re-exports**:
   - If deleting a duplicate file is risky, create an empty re-export file:
   ```typescript
   // Duplicate file
   export { default } from './MainFile';
   ```

4. **Duplication levels**:
   - Normalize **component duplicates** in the `components/` folder
   - Normalize **hook duplicates** in the `hooks/` folder
   - Normalize **context duplicates** in the `context/` folder
   - Normalize **page duplicates** in the `pages/` folder

## 3. Error Resolution and Code Standards

### 3.1 Key Focus Areas:

1. **Analyze errors and research previous solutions**
   - When an error occurs, first look for similar errors in the `public/document-errors/` folder
   - Analyze existing solutions and continue with the same approach
   - Specifically check the `resolved-errors.md` file for previously resolved similar errors

2. **Avoid file and code duplication**
   - Check existing files before creating new ones
   - Use existing components instead of recreating components that do the same job
   - Follow the DRY (Don't Repeat Yourself) principle against code duplication

3. **Maintain type system integrity**
   - Keep TypeScript interfaces centrally in the `src/types/` folder
   - Use the same types across components and leverage common types
   - Refer to `adaptation-strategies.md` for type extension help

4. **SQL and Supabase standards**
   - When using enum types, cast to text using `::text` for text-based operations
   - Manage RLS policies with functions in the `src/helpers/` folder
   - Apply consistent operator/cast conventions in SQL queries

5. **React Context and Provider hierarchy**
   - Context Providers should be in `src/App.tsx` or main layout components
   - Ensure correct Provider hierarchy
   - Avoid duplication in context usage

### 3.2 Standards by Error Category:

#### Type Errors:
- Apply standard solutions from the `type-errors.md` document
- Maximize avoidance of `any` in type error solutions
- Use type combinations (union types, intersection types) instead of interfaces

#### Import Errors:
- Apply standard solutions from the `import-errors.md` document
- Start file paths with `@/` prefix (absolute path)
- Configure barrel exports (index.ts) correctly

#### Component Errors:
- Apply standard solutions from the `component-errors.md` document
- Define Props interfaces separately
- Use standard names for component core operations (onChange, onAdd, onSubmit, etc.)

## 4. File and Folder Structure

### 4.1 Main Folder Structure

```
src/
├── __tests__/          # Test files
├── api/                # API functions
├── components/         # UI components
├── context/            # React contexts
├── data/               # Static data and mock data
├── hooks/              # Custom React hooks
├── integrations/       # 3rd-party integrations
├── lib/                # Common utility functions
├── pages/              # Page components
├── routes/             # Routing configuration
├── services/           # Business logic services
├── translations/       # I18n files
├── types/              # TypeScript interfaces and type definitions
└── utils/              # Helper functions
```

### 4.2 Component Structure

The file structure for each component should follow this pattern:
- One function or component per file
- Interfaces should be in the same file or in the `/types` folder
- Helper functions related to component functionality should be in the same file or in the `/hooks` folder

## 5. Organizing Code by Structure

### 5.1 Page Components (`pages/`)

- There should be only one page file for each route
- If there are multiple files for the same route, merge them
- Page naming should match the route name used in **routes/AppRoutes.tsx**

### 5.2 Components (`components/`)

- Components should be grouped by functionality
- Common components should be in the `components/ui/` folder
- Page-specific components should be placed in the `components/{page-name}/` folder

### 5.3 Hooks (`hooks/`)

- Hooks should not be duplicated for the same functionality
- Hooks providing the same functionality should be merged and re-exported with the previous name
- Hook names should always start with "use"

### 5.4 Contexts (`context/`)

- Contexts must provide Provider and Consumer components
- Keep context-related hooks (e.g., useAuth) in the same folder
- Main Providers should be used in: `src/App.tsx` or `src/components/layout/SidebarLayout.tsx`

## 6. Cases Requiring Special Attention

### 6.1 Urgent Problems

1. **Missing Context Providers**
   - Errors indicating that Providers are not being used in the correct component hierarchy
   - Each context hook (useX) must have a corresponding Provider (XProvider)

2. **SQL Operator Problems**
   - Errors that occur when string operators are used with enum types
   - Enums must be cast when used with operators

### 6.2 Correct Provider Hierarchy Order

Wrap React Context Providers in the following order:
```jsx
<ThemeProvider>
  <QueryClientProvider>
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
</ThemeProvider>
```

## 7. Managing Urgent Errors

Follow this sequence for errors requiring urgent resolution:

1. Get and analyze the full stack trace of the error
2. Identify the related component and main code pattern
3. Look for similar error cases in the `public/document-errors/` folder
4. Apply a solution with minimal changes
5. Update error documentation after the solution is confirmed

## 8. Adaptation Strategies

For compatibility between different API and data formats:

1. **Adapter Functions** - Write functions in the format `adaptXToY`
2. **TypeScript Utility Types** - Use helper types such as `Pick`, `Omit`, `Partial`
3. **Interface Extension** - Extend types using `extends`
4. **Alias Exports** - Provide alias exports for naming consistency

## 9. Active Components and Pages

The following components and functions are already completed and ready for use:
- Dashboard page and components
- SidebarLayout and ProtectedRoute mechanism
- AppRoutes and routing structure
- Region, Sector, and School management components
- User and Role-based permission system

## 10. Authentication and User Role System

### 10.1 Authentication Flow

1. **Login Process**
   - User enters credentials in LoginForm component
   - `login()` function from useAuthStore is called
   - On successful login, user profile and role are fetched from Supabase
   - User role is normalized using normalizeRole()
   - Authentication state is updated with isAuthenticated = true

2. **Session Management**
   - Session is maintained in useAuthStore state
   - `refreshSession()` is called to update session when needed
   - Auth state listener monitors auth events from Supabase

3. **Role-based Access Control**
   - User roles are defined in types/role.ts
   - Role hierarchy determines access permissions
   - usePermissions hook provides consistent role checks
   - Navigation components respect user role for menu visibility

### 10.2 Role Standardization

1. **Role Definition**
   - All UserRole types come from types/role.ts
   - Valid roles: 'superadmin', 'regionadmin', 'sectoradmin', 'schooladmin', 'user'
   - normalizeRole() ensures consistent role handling

2. **Component Role Integration**
   - Sidebar and navigation components use the normalized role
   - Role-based visibility is handled through boolean flags
   - Debug logs track role usage throughout the application

3. **Troubleshooting Role Issues**
   - Check console logs for "[useAuthStore]" and "[usePermissions]" entries
   - Verify that role is being properly fetched from user_roles table
   - Ensure normalizeRole() is applied to any role value from external sources
