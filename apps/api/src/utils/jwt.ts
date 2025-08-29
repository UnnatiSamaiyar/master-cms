import { payload } from "@customtype/index";
import { readFileSync } from "fs";
import jwt, { SignOptions } from "jsonwebtoken";
import { join } from "path";

const options: SignOptions = {
  algorithm: "HS256",
  expiresIn: "30d",
};

const getPrivateKeySecret = (): Buffer => {
  const filePath = join(process.cwd(), "private-key.pem");
  const secretKey = readFileSync(filePath);
  return secretKey;
};

const getPublicKeySecret = (): Buffer => {
  const filePath = join(process.cwd(), "public-key.pem");
  const secretKey = readFileSync(filePath);
  return secretKey;
};

const getAccessToken = async (payload: any): Promise<string> => {
  const secret = process.env.JWT_SECRET as string;
  const token = jwt.sign(payload, secret, options);
  return token;
};

const getRefreshToken = async (paylod: payload): Promise<string> => {
  const secret = process.env.JWT_SECRET as string;
  const token = jwt.sign(paylod, secret, {
    ...options,
    expiresIn: "30d",
  });
  return token;
};

const verifyToken = async <T>(token: string, option: SignOptions) => {
  const secret = process.env.JWT_SECRET as string;
  const isVerified = jwt.verify(token, secret, option) as T;
  return isVerified;
};

export {
  getPrivateKeySecret,
  getRefreshToken,
  getAccessToken,
  getPublicKeySecret,
  verifyToken,
  options,
};
