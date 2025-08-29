import crypto from "crypto";

export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export const pagination = (page: number, perRow: number) => (page - 1) * perRow;

export const API_KEY = process.env.WEBSITE_API_KEY;

export const BASE62_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const generateCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const generateShortId = (length: number) => {
  if (length <= 0) throw new Error("Length must be greater than 0");

  let shortId = "";
  const bytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    const index = bytes.readUInt8(i) % 62; // Ensure the index is within 0-61
    shortId += BASE62_CHARS[index];
  }

  return shortId;
};
