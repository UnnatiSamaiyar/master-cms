import { updateResponse } from "@customtype/index";
import db from "@db/index";
import { insertWebsite, websiteTable } from "@db/schema";
import { and, eq, getTableColumns } from "drizzle-orm";

class WebsiteService {
  constructor() {}

  async getWebsiteBackendUrl(websiteId: string) {
    const { id, backendUrl } = getTableColumns(websiteTable);
    const [result] = await db
      .select({ id, backendUrl })
      .from(websiteTable)
      .where(
        and(eq(websiteTable.id, websiteId), eq(websiteTable.isDeleted, false)),
      );
    return result;
  }

  async updateWebsite(
    websiteId: string,
    data: Partial<insertWebsite>,
  ): Promise<updateResponse> {
    const [result] = await db
      .update(websiteTable)
      .set(data)
      .where(eq(websiteTable.id, websiteId))
      .returning({ name: websiteTable.name });

    if (!result || !result.name) {
      return { updated: false };
    } else {
      return { updated: true, name: result.name };
    }
  }

  async deleteWebsite(websiteId: string) {
    const result = await db
      .update(websiteTable)
      .set({ isDeleted: true })
      .where(eq(websiteTable.id, websiteId))
      .returning({ id: websiteTable.id, name: websiteTable.name });

    return result;
  }

  async addWebsite(data: insertWebsite) {
    const [result] = await db
      .insert(websiteTable)
      .values(data)
      .returning({ id: websiteTable.id, name: websiteTable.name });

    return result;
  }

  async getWebsiteById(websiteId: string) {
    const result = await db
      .select()
      .from(websiteTable)
      .where(eq(websiteTable.id, websiteId))
      .limit(1);

    return result[0];
  }

  async getWebsiteByDomain(domain: string) {
    const result = await db
      .select()
      .from(websiteTable)
      .where(eq(websiteTable.domain, domain))
      .limit(1);

    return result[0];
  }

  async getAllWebsites() {
    const result = await db
      .select()
      .from(websiteTable)
      .where(eq(websiteTable.isDeleted, false));
    return result;
  }
}

export default WebsiteService;
