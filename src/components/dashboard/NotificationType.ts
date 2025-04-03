
export type NotificationType = 
  | 'approvalRequest' 
  | 'approved' 
  | 'rejected' 
  | 'formApproved' 
  | 'formRejected' 
  | 'systemUpdate' 
  | 'dueDateReminder' 
  | 'newCategory' 
  | 'info';

export type NotificationEntityType = 
  | 'category' 
  | 'column' 
  | 'entry' 
  | 'school' 
  | 'user' 
  | 'system' 
  | 'form';
