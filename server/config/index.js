import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const required = ['PORT', 'CLIENT_ORIGIN'];
for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[config] Variable ${key} no definida, usando valor por defecto`);
  }
}

export const config = {
  port: parseInt(process.env.PORT, 10) || 4000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  dbPath: process.env.DB_PATH || './hablachat.db',
  maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH, 10) || 1000,
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 1000,
  rateLimitMaxMessages: parseInt(process.env.RATE_LIMIT_MAX_MESSAGES, 10) || 5,
};
