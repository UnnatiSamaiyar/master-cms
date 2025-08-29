import { adminRoleUnion } from "@db/schema";
import { JwtPayload } from "jsonwebtoken";

export interface updateResponse {
  updated: boolean;
  name?: string;
}

export interface payload extends JwtPayload {
  id: string;
  name: string;
  email: string;
  role: adminRoleUnion;
}

declare global {
  namespace Express {
    interface Request {
      id: string;
      email: string;
      name: string;
      role: adminRoleUnion;
    }
  }
}
