import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  JWT_SECRET: process.env.JWT_SECRET ?? "change_me",
  CORS_ORIGINS: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(",").map(s => s.trim()),
};

export const s3Env = {
  S3_BUCKET: process.env.S3_BUCKET ?? "mtb-assets",
};
