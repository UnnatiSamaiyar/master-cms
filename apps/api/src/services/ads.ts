import db from "@db/index";
import {
  adsTable,
  insertAds,
  insertWebsiteAds,
  selectAds,
  selectWebsite,
  selectWebsiteAds,
  websiteAdsTable,
} from "@db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export class AdsService {
  // Create a new ad
  //
  async transformWebsiteAdsData(
    websites: selectWebsite[],
    websiteAds: selectWebsiteAds[],
  ) {
    const new_data = websites.map((website) => {
      const pushedAds = websiteAds
        .filter((item) => item.websiteId === website.id)
        .map((item) => item.adsId);
      return { ...website, pushedAds };
    });
    return new_data;
  }

  async addWebsiteAd(data: insertWebsiteAds) {
    const result = await db.insert(websiteAdsTable).values(data);
    return result;
  }

  async getWebsiteAds(adsId: string) {
    const websiteAds = await db
      .select()
      .from(websiteAdsTable)
      .where(eq(websiteAdsTable.adsId, adsId));
    return websiteAds;
  }

  async createAd(adData: insertAds) {
    const [newAd] = await db
      .insert(adsTable)
      .values(adData)
      .returning({ title: adsTable.title });
    return newAd;
  }

  // Fetch an ad by ID
  async getAdById(adId: string): Promise<selectAds | null> {
    const [ad] = await db
      .select()
      .from(adsTable)
      .where(eq(adsTable.id, adId))
      .limit(1);
    return ad || null;
  }

  // Fetch all ads
  async getAllAds(): Promise<selectAds[]> {
    const ads = await db
      .select()
      .from(adsTable)
      .where(and(eq(adsTable.status, "Active")))
      .orderBy(desc(adsTable.createdAt));
    return ads;
  }

  // Fetch ads by status
  async getAdsByStatus(status: string): Promise<selectAds[]> {
    const ads = await db
      .select()
      .from(adsTable)
      .where(eq(adsTable.status, status as any));
    return ads;
  }

  // Fetch ads by position
  async getAdsByPosition(position: string): Promise<selectAds[]> {
    const ads = await db
      .select()
      .from(adsTable)
      .where(eq(adsTable.position, position as any));
    return ads;
  }

  async updatedAd(adId: string, data: Partial<insertAds>) {
    const result = await db
      .update(adsTable)
      .set(data)
      .where(eq(adsTable.id, adId))
      .returning({ id: adsTable.id, title: adsTable.title });
    return result;
  }

  // Delete an ad
  async deleteAd(adId: string) {
    const [deletedAd] = await db
      .delete(adsTable)
      .where(eq(adsTable.id, adId))
      .returning({ id: adsTable.id, title: adsTable.title });
    return deletedAd;
  }

  // Fetch ads within a date range
  async getAdsByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<selectAds[]> {
    const ads = await db
      .select()
      .from(adsTable)
      .where(
        and(
          sql`${adsTable.startDate} >= ${startDate}`,
          sql`${adsTable.endDate} <= ${endDate}`,
        ),
      );
    return ads;
  }
}
