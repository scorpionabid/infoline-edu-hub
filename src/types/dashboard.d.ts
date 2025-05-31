
export interface CategoryItem {
  id: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  completion: number; // completion property əlavə edildi
  totalFields: number;
  completedFields: number;
  lastUpdated?: string;
  deadline?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface FormItem {
  id: string;
  title: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  lastModified: string;
  deadline?: string;
  assignedTo?: string;
  progress: number;
  category: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  deadline: string;
  status: 'upcoming' | 'overdue' | 'completed';
  priority: 'high' | 'medium' | 'low';
  daysLeft: number;
}

export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry: () => void;
  handleFormClick: (id: string) => void;
  onCategoryChange: (categoryId: string) => void; // əlavə edildi
}
