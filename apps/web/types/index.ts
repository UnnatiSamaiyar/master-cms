import { JwtPayload } from "jsonwebtoken";

export type adminRole = "admin" | "subadmin" | "content writer";

export interface payload extends JwtPayload {
  name: string;
  role: adminRole;
  email: string;
}

export interface Newsletter {
  id: string;
  email: string;
  createdAt: string;
}

export type tableType = "admins" | "websites";
