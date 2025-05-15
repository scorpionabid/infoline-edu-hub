
# InfoLine Technical Stack Documentation

## 1. Frontend Technologies

### 1.1 Core Framework and Libraries
- **React**: Core UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool for rapid development
- **React Router**: Client-side routing
- **Zustand**: State management
- **React Query**: Data fetching and caching
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: UI component library
- **Lucide**: Icon library

### 1.2 Form Management
- **React Hook Form**: Form state management
- **Zod**: Schema validation

### 1.3 Data Visualization
- **Recharts**: Responsive charting library

## 2. Backend Technologies

### 2.1 Supabase Stack
- **PostgreSQL**: Primary database
- **PostgREST**: RESTful API for PostgreSQL
- **GoTrue**: User management and authentication
- **Storage**: File storage
- **Edge Functions**: Serverless functions

### 2.2 Backend Security
- **Row Level Security (RLS)**: Database access control
- **Policies**: Granular permission rules
- **JWT Authentication**: Token-based authentication

## 3. Authentication System

### 3.1 Authentication Flow
- **Email/Password**: Primary authentication method
- **JWT Tokens**: Session management
- **Refresh Tokens**: Maintained by Supabase

### 3.2 Authorization System
- **Role-Based Access Control**: Five primary roles:
  - **superadmin**: Complete system access
  - **regionadmin**: Region-level administration
  - **sectoradmin**: Sector-level administration
  - **schooladmin**: School-level administration
  - **user**: Basic access privileges
- **Entity-Based Permissions**: Access determined by user's relationship to regions, sectors, and schools

## 4. Key Project Structures

### 4.1 Directory Structure
- **/src/components/**: UI Components
- **/src/context/**: React Context Providers
- **/src/hooks/**: React Custom Hooks
- **/src/pages/**: Page Components
- **/src/services/**: API Services
- **/src/types/**: TypeScript Type Definitions
- **/src/utils/**: Utility Functions

### 4.2 Authentication and Authorization Structure
- **AuthProvider**: Central authentication context
- **useAuthStore**: Zustand store for auth state
- **usePermissions**: Role and entity-based permission checking
- **ProtectedRoute**: Route-level access control

## 5. Data Models

### 5.1 Core Entities
- **Regions**: Geographic regions
- **Sectors**: Subdivisions of regions
- **Schools**: Educational institutions 
- **Categories**: Data collection categories
- **Columns**: Fields within categories
- **Users**: System users with roles

### 5.2 Relational Structure
- **Hierarchical Organization**: Region > Sector > School
- **Role-Based Assignments**: Users assigned to entities based on role
- **Data Hierarchies**: Categories contain columns, which define data entries

## 6. Security Architecture

### 6.1 Authentication Security
- **Password Hashing**: Managed by Supabase
- **Session Management**: JWT tokens with expiration
- **Secure Routes**: Client and server-side protection

### 6.2 Authorization Security
- **RLS Policies**: Database-level access control
- **Permission Functions**: SQL functions for access checking
- **Client-Side Guards**: React component access restrictions

## 7. Development Practices

### 7.1 Code Structure
- **Component-Based Architecture**: Reusable UI components
- **Custom Hooks**: Encapsulated logic
- **Type Safety**: Comprehensive TypeScript definitions
- **Service Abstraction**: API calls isolated in service modules

### 7.2 State Management Strategy
- **Local Component State**: UI-specific state
- **Zustand Stores**: Application-wide state
- **React Query**: Server state management
- **Context API**: Cross-cutting concerns (auth, localization)
