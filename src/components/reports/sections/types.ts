
export interface Column {
  id: string;
  name: string;
  type: string;
  category_id: string;
  category_name: string;
  is_required: boolean;
  order_index: number;
}

export interface SchoolColumnData {
  school_id: string;
  school_name: string;
  region_name: string;
  sector_name: string;
  data: Record<string, any>;
}
