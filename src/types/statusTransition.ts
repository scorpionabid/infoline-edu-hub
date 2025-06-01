export type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface StatusTransition {
  from: DataEntryStatus;
  to: DataEntryStatus;
  requiredRole: string[];
  validationRules: string[];
  description: string;
}

export interface StatusValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const STATUS_TRANSITIONS: StatusTransition[] = [
  {
    from: 'draft',
    to: 'pending',
    requiredRole: ['schooladmin'],
    validationRules: ['all_required_fields_completed'],
    description: 'School admin can submit draft for approval'
  },
  {
    from: 'pending',
    to: 'approved',
    requiredRole: ['sectoradmin', 'regionadmin', 'superadmin'],
    validationRules: ['has_approval_permission'],
    description: 'Sector/Region admin can approve pending submissions'
  },
  {
    from: 'pending',
    to: 'rejected',
    requiredRole: ['sectoradmin', 'regionadmin', 'superadmin'],
    validationRules: ['has_approval_permission', 'rejection_reason_provided'],
    description: 'Sector/Region admin can reject pending submissions'
  },
  {
    from: 'rejected',
    to: 'draft',
    requiredRole: ['schooladmin'],
    validationRules: [],
    description: 'School admin can edit rejected submissions'
  }
  // ❌ Approved → heç nə (immutable)
];
