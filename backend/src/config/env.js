import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(val => parseInt(val, 10)).default('4000'),
  DATABASE_URL: z.string().default('postgresql://medigraph:medigraph_dev_secret@localhost:5432/medigraph_db?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().default('medigraph_super_secure_access_secret_key_minimum_32_chars_long'),
  JWT_REFRESH_SECRET: z.string().default('medigraph_super_secure_refresh_secret_key_minimum_32_chars_long'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('./storage/uploads'),
  MAX_FILE_SIZE_BYTES: z.string().transform(val => parseInt(val, 10)).default('15728640'), // 15MB
  DOCUMENT_SERVICE_URL: z.string().default('http://localhost:8000'),
  GEMINI_API_KEY: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('CRITICAL: Environment validation failed:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;

