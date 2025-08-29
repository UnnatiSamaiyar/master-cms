import { updateResponse } from "@customtype/index";
import db from "@db/index";
import {
  adminRoleUnion,
  adminTable,
  adminVerificationTable,
  insertAdmin,
  insertAdminVerification,
  websiteAdminTable,
  websiteTable,
} from "@db/schema";
import { and, eq, getTableColumns } from "drizzle-orm";

class AdminService {
  constructor() {}

  async removeCode(id: string) {
    return db
      .delete(adminVerificationTable)
      .where(eq(adminVerificationTable.id, id));
  }

  async addPasswordToken(data: insertAdminVerification) {
    const result = await db.insert(adminVerificationTable).values(data);
    return result;
  }

  async isPasswordTokenExist(adminId: string) {
    const [token] = await db
      .select()
      .from(adminVerificationTable)
      .where(eq(adminVerificationTable.adminId, adminId))
      .limit(1);
    return token;
  }

  async assignedWebsite(adminId: string) {
    const { createdAt, updatedAt, ...rest } = getTableColumns(websiteTable);
    const websites = await db
      .select({ ...rest })
      .from(websiteAdminTable)
      .where(eq(websiteAdminTable.adminId, adminId))
      .leftJoin(websiteTable, eq(websiteAdminTable.websiteId, websiteTable.id));
    return websites;
  }

  async changeRole(id: string, role: adminRoleUnion): Promise<updateResponse> {
    const result = await db
      .update(adminTable)
      .set({ role })
      .where(and(eq(adminTable.id, id), eq(adminTable.isDeleted, false)));
    return result.rowCount !== 1 ? { updated: false } : { updated: true };
  }

  async updateAdmin(
    adminId: string,
    data: Partial<insertAdmin>,
  ): Promise<updateResponse> {
    const [result] = await db
      .update(adminTable)
      .set(data)
      .where(eq(adminTable.id, adminId))
      .returning({ name: adminTable.name });

    if (!result || !result.name) {
      return { updated: false };
    } else {
      return { updated: true, name: result.name };
    }
  }

  async deleteAdmin(adminId: string) {
    const result = await db
      .delete(adminTable)
      .where(eq(adminTable.id, adminId))
      .returning({ id: adminTable.id });

    return result;
  }

  async addAdmin(data: insertAdmin) {
    const [result] = await db
      .insert(adminTable)
      .values(data)
      .returning({ id: adminTable.id, name: adminTable.name });

    return result;
  }

  async getAdminById(adminId: string, showPassword: boolean = false) {
    const { password, ...rest } = getTableColumns(adminTable);

    const result = await db
      .select({
        ...rest,
        ...(showPassword ? { password: adminTable.password } : {}),
      })
      .from(adminTable)
      .where(eq(adminTable.id, adminId))
      .limit(1);

    return result[0];
  }

  async getAdminByEmail(email: string, showPassword: boolean = false) {
    const { password, ...rest } = getTableColumns(adminTable);
    const result = await db
      .select({
        ...rest,
        ...(showPassword ? { password: adminTable.password } : {}),
      })
      .from(adminTable)
      .where(eq(adminTable.email, email))
      .limit(1);

    return result[0];
  }

  async getAllAdmins() {
    const { password, updatedAt, isDeleted, isVerified, ...rest } =
      getTableColumns(adminTable);
    const result = await db
      .select({ ...rest })
      .from(adminTable)
      .where(
        and(
          eq(adminTable.isVerified, true),
          eq(adminTable.isDeleted, false),
          eq(adminTable.role, "subadmin"),
        ),
      );

    return result;
  }

  async getAdminsByRole(role: "admin" | "subadmin") {
    const result = await db
      .select()
      .from(adminTable)
      .where(eq(adminTable.role, role));

    return result;
  }

  async verifyAdmin(adminId: string) {
    const [result] = await db
      .update(adminTable)
      .set({ isVerified: true })
      .where(eq(adminTable.id, adminId))
      .returning({ id: adminTable.id });

    return result;
  }

  async unverifyAdmin(adminId: string) {
    const [result] = await db
      .update(adminTable)
      .set({ isVerified: false })
      .where(eq(adminTable.id, adminId))
      .returning({ id: adminTable.id });

    return result;
  }
}

export default AdminService;
