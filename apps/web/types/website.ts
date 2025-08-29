export interface Website {
  id: string;
  name: string;
  domain: string;
  backendUrl: string;
  isDeleted: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
