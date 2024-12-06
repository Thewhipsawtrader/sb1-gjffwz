import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.number().default(5000),
  corsOrigin: z.string().url().default('http://localhost:3000'),
  mongodb: z.object({
    uri: z.string().url(),
    dbName: z.string()
  }),
  mikrotikApi: z.object({
    url: z.string().url(),
    key: z.string()
  }),
  whatsappApi: z.object({
    url: z.string().url(),
    key: z.string(),
    groupId: z.string()
  }),
  clerk: z.object({
    secretKey: z.string()
  }),
  email: z.object({
    host: z.string(),
    port: z.number(),
    secure: z.boolean(),
    user: z.string(),
    password: z.string(),
    fromName: z.string(),
    fromAddress: z.string().email(),
    supportEmail: z.string().email(),
    creatorEmail: z.string().email(),
    reportRecipients: z.object({
      daily: z.string().email(),
      monthly: z.string().email(),
    }),
    alertRecipients: z.array(z.string().email())
  })
});

const config = configSchema.parse({
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT),
  corsOrigin: process.env.CORS_ORIGIN,
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME
  },
  mikrotikApi: {
    url: process.env.MIKROTIK_API_URL,
    key: process.env.MIKROTIK_API_KEY
  },
  whatsappApi: {
    url: process.env.WHATSAPP_API_URL,
    key: process.env.WHATSAPP_API_KEY,
    groupId: process.env.WHATSAPP_GROUP_ID
  },
  clerk: {
    secretKey: process.env.CLERK_SECRET_KEY
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    fromName: process.env.EMAIL_FROM_NAME,
    fromAddress: process.env.EMAIL_FROM_ADDRESS,
    supportEmail: process.env.EMAIL_SUPPORT,
    creatorEmail: process.env.EMAIL_CREATOR,
    reportRecipients: {
      daily: process.env.EMAIL_SUPPORT,
      monthly: process.env.EMAIL_SUPPORT,
    },
    alertRecipients: [process.env.EMAIL_SUPPORT, process.env.EMAIL_CREATOR]
  }
});

export { config };