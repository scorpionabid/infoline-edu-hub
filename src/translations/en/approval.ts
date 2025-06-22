// Approval translation module - English version
export const approval = {
  // Page titles
  title: 'Approval Manager',
  subtitle: 'Review and approve school data',
  page_title: 'Approval Process',
  
  // Tab labels
  pending_tab: 'Pending ({{count}})',
  approved_tab: 'Approved ({{count}})',
  rejected_tab: 'Rejected ({{count}})',
  draft_tab: 'Draft ({{count}})',
  
  // Action buttons
  approve_item: 'Approve',
  reject_item: 'Reject',
  view_details: 'View Details',
  bulk_approve: 'Bulk Approve',
  bulk_reject: 'Bulk Reject',
  
  // Dialogs
  bulk_dialog_title_approve: 'Bulk Approval',
  bulk_dialog_title_reject: 'Bulk Rejection',
  reject_dialog_title: 'Reject Data',
  
  // Form labels
  rejection_reason_label: 'Rejection Reason *',
  rejection_reason_placeholder: 'Enter rejection reason...',
  additional_comment_label: 'Additional Comment (optional)',
  additional_comment_placeholder: 'Additional comment...',
  
  // Alerts and warnings
  bulk_operation_warning: 'This operation will be applied to {{count}} items and cannot be undone.',
  rejection_warning: 'This operation cannot be undone. The rejection reason will be sent to the school admin.',
  
  // Status badges
  status_pending: 'Pending',
  status_approved: 'Approved',
  status_rejected: 'Rejected',
  status_draft: 'Draft',
  status_unknown: 'Unknown',
  
  // Item descriptions
  item_school_name: 'School: {{name}}',
  item_category: 'Category: {{category}}',
  item_completion: '{{rate}}% completed',
  item_submitted: 'Submitted: {{date}}',
  
  // Selection
  items_selected: '{{count}} items selected',
  select_all_items: 'Select all items',
  clear_selection: 'Clear selection',
  
  // Empty states
  no_items_found: 'No items found',
  no_pending_items: 'No pending data',
  no_approved_items: 'No approved data',
  no_rejected_items: 'No rejected data',
  no_draft_items: 'No draft data',
  empty_state_message: 'No data in this status',
  
  // Search and filter
  search_placeholder: 'Search school or category...',
  filter_reset: 'Reset Filter',
  refresh_data: 'Refresh',
  
  // Stats cards
  stats_total: 'Total',
  stats_pending: 'Pending',
  stats_approved: 'Approved',
  stats_rejected: 'Rejected',
  stats_draft: 'Draft',
  
  // Success messages
  approve_success: 'Data approved successfully',
  reject_success: 'Data rejected successfully',
  bulk_approve_success: 'Selected data approved successfully',
  bulk_reject_success: 'Selected data rejected successfully',
  
  // Error messages
  approve_error: 'Approval error: {{error}}',
  reject_error: 'Rejection error: {{error}}',
  load_error: 'Error loading data',
  
  // Loading states
  loading_data: 'Loading data...',
  processing_approval: 'Approving...',
  processing_rejection: 'Rejecting...',
  processing_bulk: 'Processing bulk operation...',
  
  // Tooltips
  tooltip_view: 'View details',
  tooltip_approve: 'Approve this data',
  tooltip_reject: 'Reject this data',
  tooltip_refresh: 'Refresh data',
  tooltip_filter: 'Reset filter',
  
  // Context descriptions
  school_data_context: '{{schoolName}} school {{categoryName}} category data'
} as const;

export type Approval = typeof approval;
export default approval;
