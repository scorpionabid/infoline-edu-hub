
export interface LinkFormProps {
  onSubmit: (linkData: any) => Promise<void>;
  onCancel: () => void;
  editData?: SchoolLink;
}

export interface SchoolLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  school_id: string;
  created_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
