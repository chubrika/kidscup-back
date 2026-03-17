import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load `.env` deterministically in dev, regardless of where Node is launched from.
// (Some setups start the process with a different CWD, causing dotenv to miss the file.)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..'); // kidscup-back/

dotenv.config({ path: path.join(projectRoot, '.env') });

const defaultMongoUri = 'mongodb+srv://chubro15_db_user:Lv2k9pjYkRm8752z@kidscup.ykzzzon.mongodb.net/kidscup';
const mongodbUri = process.env.MONGODB_URI || defaultMongoUri;

if (mongodbUri === defaultMongoUri && process.env.NODE_ENV !== 'development') {
  console.error(
    'Missing MONGODB_URI. Create a .env file from .env.example and set MONGODB_URI with your MongoDB connection string (replace <db_password> with your Atlas password).'
  );
}

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri,
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  corsOrigin: process.env.CORS_ORIGIN || '*',
  r2: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    publicBaseUrl: process.env.R2_PUBLIC_BASE_URL, 
    signedUrlExpiresInSeconds: Number(process.env.R2_SIGNED_URL_EXPIRES_IN || 300),
  },
};
