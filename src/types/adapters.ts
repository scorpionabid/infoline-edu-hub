
// Type adapters - fix missing imports and properties

import { School, SchoolFormData, SchoolCreateParams, SchoolUpdateParams, SchoolAdmin } from './school';
import { DashboardNotification, NotificationType } from './dashboard';

// School adapters
export function adaptSchoolToFormData(school: School): SchoolFormData {
  return {
    name: school.name,
    address: school.address,
    phone: school.phone,
    email: school.email,
    region_id: school.region_id, // Fix: use correct property name
    sector_id: school.sector_id, // Fix: use correct property name
    status: school.status,
  };
}

export function adaptFormDataToSchool(formData: SchoolFormData): SchoolCreateParams {
  return {
    name: formData.name,
    address: formData.address,
    phone: formData.phone,
    email: formData.email,
    region_id: formData.region_id,
    sector_id: formData.sector_id,
    status: formData.status || 'active',
  };
}

// Notification adapters
export function adaptDashboardNotificationToApp(notification: DashboardNotification) {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    read: notification.read,
    created_at: notification.created_at,
  };
}
