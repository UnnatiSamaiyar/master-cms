import { timestamps } from "@utils/timestamps";
import { varchar } from "drizzle-orm/pg-core";
import { pgTable, uuid } from "drizzle-orm/pg-core";
import { boolean } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";

export const adminRoleEnum = pgEnum("role", ["admin", "subadmin"]);

export type adminRoleUnion = (typeof adminRoleEnum)["enumValues"][number];

export const adminTable = pgTable("admin", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("slug", { length: 256 }).notNull(),
  password: varchar("password", { length: 256 }).notNull(),
  isVerified: boolean("is_verified").default(true).notNull(),
  role: adminRoleEnum("role").notNull(),
  ...timestamps,
});

export type insertAdmin = typeof adminTable.$inferInsert;
export type selectAdmin = typeof adminTable.$inferSelect;
