import { timestamps } from "@utils/timestamps";
import { varchar } from "drizzle-orm/pg-core";
import { pgTable, uuid } from "drizzle-orm/pg-core";
import { adminTable } from "./admin";
import { timestamp } from "drizzle-orm/pg-core";

export const adminVerificationTable = pgTable("admin_verification", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  adminId: uuid("admin_id")
    .references(() => adminTable.id)
    .notNull()
    .unique(),
  code: varchar("code", { length: 6 }).notNull(),
  expireAt: timestamp("expire_at").notNull(),
  ...timestamps,
});

export type insertAdminVerification =
  typeof adminVerificationTable.$inferInsert;
export type selectAdminVerification =
  typeof adminVerificationTable.$inferSelect;
