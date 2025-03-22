
export type Category = {
  id: string;
  name: string;
  assignment: "all" | "sectors";
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive";
  priority: number;
  archived?: boolean;
};
