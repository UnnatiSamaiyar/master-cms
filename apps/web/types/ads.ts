export interface AdType {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Inactive";
  position: string;
  isRightSideBar: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
