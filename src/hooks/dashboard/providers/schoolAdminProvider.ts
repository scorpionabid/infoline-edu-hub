import { FormItem, SchoolAdminDashboardData } from "@/types/dashboard";
import { supabase } from "@/integrations/supabase/client";
import { adaptFormStatus } from "@/utils/dashboardUtils";
import { formatTimeFromNow } from "@/utils/formatTimeFromNow";

export const useSchoolAdminDashboard = () => {
  const isLoading = false;
  const error = null;

  const getDashboardData = async (schoolId?: string): Promise<SchoolAdminDashboardData | null> => {
    if (!schoolId) return null;
    
    try {
      const data = await getSchoolAdminDashboardData(schoolId);
      return data;
    } catch (err) {
      console.error("Error fetching school admin dashboard data:", err);
      return null;
    }
  };

  return {
    getDashboardData,
    isLoading,
    error
  };
};

export const getSchoolAdminDashboardData = async (schoolId: string): Promise<SchoolAdminDashboardData> => {
  // Fetch school details
  const { data: schoolData } = await supabase
    .from('schools')
    .select(`
      *,
      regions (name),
      sectors (name)
    `)
    .eq('id', schoolId)
    .single();

  // Fetch categories for this school
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('deadline');

  // Fetch data entries for this school
  const { data: entries } = await supabase
    .from('data_entries')
    .select('*')
    .eq('school_id', schoolId);

  // Fetch notifications for this school
  const { data: notificationsData } = await supabase
    .from('notifications')
    .select('*')
    .eq('related_entity_id', schoolId)
    .order('created_at', { ascending: false })
    .limit(10);

  // Calculate form statistics
  let pending = 0;
  let approved = 0;
  let rejected = 0;
  let dueSoon = 0;
  let overdue = 0;

  // Create form items from categories
  const pendingForms: FormItem[] = [];
  const completedForms: FormItem[] = [];
  const recentForms: FormItem[] = [];
  const dueSoonForms: FormItem[] = [];
  const overdueForms: FormItem[] = [];

  if (categories) {
    categories.forEach(category => {
      // Calculate completion percentage for this category
      const categoryEntries = entries?.filter(entry => entry.category_id === category.id) || [];
      const totalColumns = category.column_count || 0;
      const filledCount = categoryEntries.length;
      const completionPercentage = totalColumns > 0 ? Math.round((filledCount / totalColumns) * 100) : 0;
      
      // Determine form status
      let status = 'pending';
      const now = new Date();
      const deadline = category.deadline ? new Date(category.deadline) : null;
      
      if (categoryEntries.some(entry => entry.status === 'rejected')) {
        status = 'rejected';
        rejected++;
      } else if (categoryEntries.length === totalColumns && categoryEntries.every(entry => entry.status === 'approved')) {
        status = 'approved';
        approved++;
      } else if (deadline && deadline < now) {
        status = 'overdue';
        overdue++;
      } else if (deadline && (deadline.getTime() - now.getTime()) < 3 * 24 * 60 * 60 * 1000) {
        status = 'dueSoon';
        dueSoon++;
      } else {
        pending++;
      }
      
      const formItem: FormItem = {
        id: category.id,
        title: category.name,
        status: adaptFormStatus(status),
        completionPercentage,
        deadline: category.deadline || '',
        categoryId: category.id,
        filledCount,
        totalCount: totalColumns,
        dueDate: category.deadline,
        categoryName: category.name
      };
      
      // Add to appropriate lists
      recentForms.push(formItem);
      
      if (status === 'approved' || status === 'rejected') {
        completedForms.push(formItem);
      } else {
        pendingForms.push(formItem);
      }
      
      if (status === 'dueSoon') {
        dueSoonForms.push(formItem);
      }
      
      if (status === 'overdue') {
        overdueForms.push(formItem);
      }
    });
  }

  // Sort forms by deadline
  const sortByDeadline = (a: FormItem, b: FormItem) => {
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  };
  
  recentForms.sort(sortByDeadline);
  pendingForms.sort(sortByDeadline);
  dueSoonForms.sort(sortByDeadline);
  overdueForms.sort(sortByDeadline);

  // Format notifications
  const notifications = notificationsData?.map(notification => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message || '',
    priority: notification.priority || 'normal',
    userId: notification.user_id,
    createdAt: notification.created_at,
    isRead: notification.is_read || false,
    time: formatTimeFromNow(notification.created_at),
    relatedEntityId: notification.related_entity_id || '',
    relatedEntityType: notification.related_entity_type || 'system',
  })) || [];

  // Create activity data
  const activityData = entries?.slice(0, 10).map((entry, index) => ({
    id: entry.id,
    type: 'data',
    title: `Data entry ${entry.status || 'updated'}`,
    description: `Column data was ${entry.status || 'updated'}`,
    timestamp: entry.updated_at || entry.created_at,
    userId: entry.created_by || '',
    action: entry.status || 'update',
    actor: 'User',
    target: 'Data Entry',
    time: formatTimeFromNow(entry.updated_at || entry.created_at),
  })) || [];

  // Calculate overall completion rate
  const totalCategories = categories?.length || 0;
  const completedCategories = approved;
  const completionRate = totalCategories > 0 ? Math.round((completedCategories / totalCategories) * 100) : 0;

  return {
    schoolName: schoolData?.name || 'Unknown School',
    sectorName: schoolData?.sectors?.name || 'Unknown Sector',
    regionName: schoolData?.regions?.name || 'Unknown Region',
    forms: {
      pending,
      approved,
      rejected,
      dueSoon,
      overdue
    },
    completionRate,
    notifications,
    pendingForms,
    completedForms,
    recentForms,
    dueSoonForms,
    overdueForms,
    activityData
  };
};
