export type adminRole = "admin" | "subadmin" | "content writer";

export type adminType = {
  id: string;
  name: string;
  email: string;
  role: adminRole;
  isDeleted: boolean;
  isVerified: boolean;
  createdAt: string;
};

export enum adminRoleEnum {
  admin = "admin",
  subadmin = "subadmin",
  contentwriter = "content writer",
}
