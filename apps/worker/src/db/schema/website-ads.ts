import { timestamps } from "@utils/timestamps";
import { pgTable, uuid } from "drizzle-orm/pg-core";
import { websiteTable } from "./website";
import { adsTable } from "./ads";

export const websiteAdsTable = pgTable("website_ads", {
  id: uuid("id").primaryKey().defaultRandom(),
  websiteId: uuid("website_id").references(() => websiteTable.id, {
    onDelete: "cascade",
  }),
  adsId: uuid("ads_id").references(() => adsTable.id, {
    onDelete: "cascade",
  }),
  ...timestamps,
});

export type insertWebsiteAds = typeof websiteAdsTable.$inferInsert;
export type selectWebsiteAds = typeof websiteAdsTable.$inferSelect;
