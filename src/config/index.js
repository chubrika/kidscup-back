import dotenv from 'dotenv';

dotenv.config();

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
};
