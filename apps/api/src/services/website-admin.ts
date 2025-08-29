import db from "@db/index";
import { adminTable, insertWebsiteAdmin, websiteAdminTable } from "@db/schema";
import { and, eq, getTableColumns, inArray } from "drizzle-orm";

class WebsiteAdminService {
  async removeAdmins(websiteId: string, adminIds: string[]) {
    const result = await db
      .delete(websiteAdminTable)
      .where(
        and(
          eq(websiteAdminTable.websiteId, websiteId),
          inArray(websiteAdminTable.adminId, adminIds),
        ),
      );
    return result;
  }

  async assignAdmins(data: insertWebsiteAdmin[]) {
    const result = await db.insert(websiteAdminTable).values(data);
    return result;
  }
  async getAdmins(websiteId: string) {
    const { id, name, email } = getTableColumns(adminTable);
    const result = await db
      .select({
        id,
        name,
        email,
        websiteId: websiteAdminTable.websiteId,
      })
      .from(websiteAdminTable)
      .where(eq(websiteAdminTable.websiteId, websiteId))
      .leftJoin(
        adminTable,
        and(
          eq(websiteAdminTable.adminId, adminTable.id),
          eq(adminTable.isDeleted, false),
        ),
      );
    return result;
  }
}

export default WebsiteAdminService;
