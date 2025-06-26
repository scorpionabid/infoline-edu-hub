
import { DashboardNotification, NotificationType } from './dashboard';
import { 
  SchoolFormData, 
  School, 
  SchoolCreateParams, 
  SchoolUpdateParams,
  // SchoolAdmin
} from './school';

export interface FormNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: NotificationType;
  read: boolean;
}

export const adaptNotification = (notification: DashboardNotification): FormNotification => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    timestamp: notification.timestamp,
    type: notification.type || 'info',
    read: notification.read
  };
};

export const adaptForm = (school: School): SchoolFormData => {
  return {
    name: school.name,
    regionId: school.regionId || school.region_id || '',
    sectorId: school.sectorId || school.sector_id || '',
    address: school.address || '',
    phone: school.phone || '',
    email: school.email || '',
    type: school.type || '',
    language: school.language || '',
    status: school.status || 'active',
    principal_name: school.principal_name || '',
    student_count: school.student_count || 0,
    teacher_count: school.teacher_count || 0,
  };
};
