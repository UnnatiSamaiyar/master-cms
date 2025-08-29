import { updateResponse } from "@customtype/index";
import db from "@db/index";
import {
  sectionTable,
  insertSection,
  insertarticleSection,
  articleSectionTable,
} from "@db/schema";
import { and, eq } from "drizzle-orm";

class SectionService {
  constructor() {}

  async addArticleSection(data: insertarticleSection) {
    const [result] = await db
      .insert(articleSectionTable)
      .values(data)
      .returning({ id: articleSectionTable.id });

    return result;
  }

  async deleteArticleSection(articleSectionId: string) {
    const result = await db
      .delete(articleSectionTable)
      .where(eq(articleSectionTable.id, articleSectionId))
      .returning({ id: articleSectionTable.id });

    return result;
  }

  async deleteArticleSectionByArticleAndSection(
    articleId: string,
    sectionId: string,
  ) {
    const result = await db
      .delete(articleSectionTable)
      .where(
        and(
          eq(articleSectionTable.articleId, articleId),
          eq(articleSectionTable.sectionId, sectionId),
        ),
      )
      .returning({ id: articleSectionTable.id });

    return result;
  }

  async getArticleSectionById(articleSectionId: string) {
    const result = await db
      .select()
      .from(articleSectionTable)
      .where(eq(articleSectionTable.id, articleSectionId))
      .limit(1);

    return result[0];
  }

  async getSectionsByArticleId(articleId: string) {
    const result = await db
      .select()
      .from(articleSectionTable)
      .where(eq(articleSectionTable.articleId, articleId));

    return result;
  }

  async getArticlesBySectionId(sectionId: string) {
    const result = await db
      .select()
      .from(articleSectionTable)
      .where(eq(articleSectionTable.sectionId, sectionId));

    return result;
  }

  async updateSection(
    sectionId: string,
    data: Partial<insertSection>,
  ): Promise<updateResponse> {
    const [result] = await db
      .update(sectionTable)
      .set(data)
      .where(eq(sectionTable.id, sectionId))
      .returning({ name: sectionTable.name });

    if (!result || !result.name) {
      return { updated: false };
    } else {
      return { updated: true, name: result.name };
    }
  }

  async deleteSection(sectionId: string) {
    const result = await db
      .delete(sectionTable)
      .where(eq(sectionTable.id, sectionId))
      .returning({ id: sectionTable.id, name: sectionTable.name });

    return result;
  }

  async addSection(data: insertSection) {
    const [result] = await db
      .insert(sectionTable)
      .values(data)
      .returning({ id: sectionTable.id, name: sectionTable.name });

    return result;
  }

  async getSectionById(sectionId: string) {
    const result = await db
      .select()
      .from(sectionTable)
      .where(eq(sectionTable.id, sectionId))
      .limit(1);

    return result[0];
  }

  async getAllSections() {
    const result = await db.select().from(sectionTable);

    return result;
  }

  async getMainSections() {
    const result = await db
      .select()
      .from(sectionTable)
      .where(eq(sectionTable.isMain, true));

    return result;
  }
}

export default SectionService;
