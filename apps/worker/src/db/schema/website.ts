import { timestamps } from "@utils/timestamps";
import { boolean } from "drizzle-orm/pg-core";
import { varchar } from "drizzle-orm/pg-core";
import { pgTable, uuid } from "drizzle-orm/pg-core";

export const websiteTable = pgTable("website", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).unique().notNull(),
  backendUrl: varchar("backend_url", { length: 255 }).notNull(),
  isDeleted: boolean("is_deleted").notNull().default(false),
  ...timestamps,
});

export type insertWebsite = typeof websiteTable.$inferInsert;
export type selectWebsite = typeof websiteTable.$inferSelect;
