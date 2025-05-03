
export interface AssignUserResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface AssignSchoolAdminParams {
  schoolId: string;
  userId: string;
}

export interface UseAssignExistingUserAsSchoolAdminReturn {
  assignUserAsSchoolAdmin: (schoolId: string, userId: string) => Promise<AssignUserResult>;
  loading: boolean;
}
