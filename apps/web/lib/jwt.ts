import jwt, { JwtPayload } from "jsonwebtoken";

export async function decodeToken<T = JwtPayload>(token: string): Promise<T> {
  const decoded = jwt.decode(token) as T;
  return decoded;
}
