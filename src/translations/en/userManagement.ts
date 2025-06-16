// User management translation module
export const userManagement = {
  title: 'User Management',
  description: 'Management of users, roles and permissions',
  
  // Basic actions
  actions: {
    create_user: 'Create User',
    edit_user: 'Edit User',
    delete_user: 'Delete User',
    view_user: 'View User',
    assign_role: 'Assign Role',
    change_password: 'Change Password',
    reset_password: 'Reset Password',
    activate_user: 'Activate User',
    deactivate_user: 'Deactivate User',
    export_users: 'Export Users',
    import_users: 'Import Users',
    bulk_actions: 'Bulk Actions',
    invite_user: 'Invite User',
    send_notification: 'Send Notification'
  },

  // User form
  form: {
    personal_info: 'Personal Information',
    full_name: 'Full Name',
    first_name: 'First Name',
    last_name: 'Last Name',
    email: 'Email Address',
    phone: 'Phone Number',
    position: 'Position',
    department: 'Department',
    
    account_info: 'Account Information',
    username: 'Username',
    password: 'Password',
    confirm_password: 'Confirm Password',
    role: 'Role',
    permissions: 'Permissions',
    status: 'Status',
    
    location_info: 'Location Information',
    region: 'Region',
    sector: 'Sector',
    school: 'School',
    
    preferences: 'Preferences',
    language: 'Language',
    timezone: 'Timezone',
    notifications: 'Notifications',
    
    // Placeholder texts
    enter_full_name: 'Enter full name',
    enter_email: 'Enter email address',
    enter_phone: 'Enter phone number',
    enter_position: 'Enter position',
    select_role: 'Select role',
    select_region: 'Select region',
    select_sector: 'Select sector',
    select_school: 'Select school',
    select_language: 'Select language',
    select_status: 'Select status'
  },

  // Roles
  roles: {
    superadmin: 'Super Admin',
    regionadmin: 'Region Admin',
    sectoradmin: 'Sector Admin',
    schooladmin: 'School Admin',
    user: 'User',
    viewer: 'Viewer',
    editor: 'Editor',
    moderator: 'Moderator'
  },

  // Statuses
  statuses: {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    suspended: 'Suspended',
    banned: 'Banned',
    invited: 'Invited',
    expired: 'Expired'
  },

  // Table headers
  table: {
    name: 'Name',
    email: 'Email',
    role: 'Role',
    status: 'Status',
    region: 'Region',
    sector: 'Sector',
    school: 'School',
    last_login: 'Last Login',
    created_at: 'Created',
    actions: 'Actions',
    select: 'Select',
    no_users: 'No users found',
    loading_users: 'Loading users...'
  },

  // Filters
  filters: {
    search_users: 'Search users...',
    filter_by_role: 'Filter by role',
    filter_by_status: 'Filter by status',
    filter_by_region: 'Filter by region',
    filter_by_sector: 'Filter by sector',
    all_roles: 'All roles',
    all_statuses: 'All statuses',
    all_regions: 'All regions',
    all_sectors: 'All sectors',
    active_only: 'Active only',
    inactive_only: 'Inactive only',
    recent_login: 'Recent login',
    never_logged: 'Never logged in'
  },

  // Messages
  messages: {
    user_created: 'User successfully created',
    user_updated: 'User information updated',
    user_deleted: 'User deleted',
    user_activated: 'User activated',
    user_deactivated: 'User deactivated',
    password_reset: 'Password reset',
    password_changed: 'Password changed',
    invitation_sent: 'Invitation sent',
    notification_sent: 'Notification sent',
    bulk_action_completed: 'Bulk action completed',
    
    // Error messages
    user_not_found: 'User not found',
    email_already_exists: 'This email already exists',
    username_taken: 'This username is already taken',
    invalid_role: 'Invalid role',
    permission_denied: 'Permission denied',
    cannot_delete_self: 'You cannot delete yourself',
    cannot_delete_admin: 'Cannot delete admin user',
    
    // Confirmation messages
    confirm_delete: 'Are you sure you want to delete this user?',
    confirm_deactivate: 'Are you sure you want to deactivate this user?',
    confirm_bulk_delete: 'Are you sure you want to delete {{count}} users?',
    confirm_password_reset: 'Are you sure you want to reset this user\'s password?'
  },

  // Statistics
  stats: {
    total_users: 'Total Users',
    active_users: 'Active Users',
    inactive_users: 'Inactive Users',
    pending_users: 'Pending Users',
    online_users: 'Online Users',
    new_this_month: 'New this month',
    admins: 'Admins',
    regular_users: 'Regular Users',
    last_login_today: 'Logged in today',
    never_logged: 'Never logged in'
  },

  // Page sections
  tabs: {
    overview: 'Overview',
    users: 'Users',
    roles: 'Roles',
    permissions: 'Permissions',
    activity: 'Activity',
    settings: 'Settings',
    audit_log: 'Audit Log'
  },

  // Permissions
  permissions: {
    view: 'View',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    manage: 'Manage',
    approve: 'Approve',
    export: 'Export',
    import: 'Import',
    full_access: 'Full Access',
    read_only: 'Read Only',
    limited_access: 'Limited Access'
  },

  // Invitation process
  invitation: {
    invite_user: 'Invite User',
    send_invitation: 'Send Invitation',
    invitation_email: 'Invitation Email',
    invitation_message: 'Invitation Message',
    invitation_expires: 'Invitation Expires',
    custom_message: 'Custom Message',
    default_message: 'You are invited to join InfoLine system',
    pending_invitations: 'Pending Invitations',
    accepted_invitations: 'Accepted Invitations',
    expired_invitations: 'Expired Invitations',
    resend_invitation: 'Resend Invitation',
    cancel_invitation: 'Cancel Invitation'
  }
} as const;

export type UserManagement = typeof userManagement;
export default userManagement;