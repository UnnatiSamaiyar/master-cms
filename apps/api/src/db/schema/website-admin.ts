import { timestamps } from "@utils/timestamps";
import { pgTable, uuid } from "drizzle-orm/pg-core";
import { websiteTable } from "./website";
import { adminTable } from "./admin";

export const websiteAdminTable = pgTable("website_admin", {
  id: uuid("id").primaryKey().defaultRandom(),
  websiteId: uuid("website_id").references(() => websiteTable.id, {
    onDelete: "cascade",
  }),
  adminId: uuid("admin_id").references(() => adminTable.id, {
    onDelete: "cascade",
  }),
  ...timestamps,
});

export type insertWebsiteAdmin = typeof websiteAdminTable.$inferInsert;
export type selectWebsiteAdmin = typeof websiteAdminTable.$inferSelect;
