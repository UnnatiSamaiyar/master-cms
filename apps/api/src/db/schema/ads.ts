import { timestamps } from "@utils/timestamps";
import { pgEnum, varchar } from "drizzle-orm/pg-core";
import { pgTable, uuid } from "drizzle-orm/pg-core";
import { text } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("ads_status_enum", ["Active", "Draft"]);
export const positionEnum = pgEnum("ads_position_enum", [
  "Sidebar",
  "Footer",
  "center",
  "Header",
]);

export const adsTable = pgTable("ads", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("name", { length: 255 }).notNull(),
  imageUrl: text("image_url").notNull(),
  targetUrl: text("target_url").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: statusEnum("status").default("Draft"),
  position: positionEnum("position").default("Sidebar"),
  ...timestamps,
});

export type insertAds = typeof adsTable.$inferInsert;
export type selectAds = typeof adsTable.$inferSelect;
