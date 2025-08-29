export type Subcategory = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

export type Category = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  subcategories: Subcategory[];
};
