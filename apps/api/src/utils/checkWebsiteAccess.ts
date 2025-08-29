import db from "@db/index";
import { websiteAdminTable } from "@db/schema";
import { and, eq } from "drizzle-orm";
import ApiError from "./apiError";
import { httpStatusCode } from "@customtype/http";

export const checkWebsiteAccess = async (
  websiteId: string,
  adminId: string,
) => {
  const [websiteAdmin] = await db
    .select()
    .from(websiteAdminTable)
    .where(
      and(
        eq(websiteAdminTable.websiteId, websiteId),
        eq(websiteAdminTable.adminId, adminId),
      ),
    );
  if (!websiteAdmin)
    throw new ApiError(
      "You don't have permission.",
      httpStatusCode.BAD_REQUEST,
    );
  return { access: true, data: websiteAdmin };
};
