import crypto from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/index.js';

const required = (name, value) => {
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

const r2Client = () => {
  const accountId = required('CLOUDFLARE_ACCOUNT_ID', config.r2.accountId);
  const accessKeyId = required('R2_ACCESS_KEY_ID', config.r2.accessKeyId);
  const secretAccessKey = required('R2_SECRET_ACCESS_KEY', config.r2.secretAccessKey);

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    // Cloudflare R2 default endpoints are path-style; bucket-as-subdomain will often fail TLS/DNS.
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
};

const bucketName = () => required('R2_BUCKET_NAME', config.r2.bucketName);

const extFromContentType = (contentType) => {
  const t = (contentType || '').toLowerCase().trim();
  if (t === 'image/jpeg' || t === 'image/jpg') return 'jpg';
  if (t === 'image/png') return 'png';
  if (t === 'image/webp') return 'webp';
  return null;
};

export const buildPublicFileUrl = (key) => {
  const base = config.r2.publicBaseUrl?.trim();
  if (base) return `${base.replace(/\/+$/, '')}/${key}`;
  // Fallback: S3-style URL (works if your bucket is publicly accessible via R2)
  return `https://${config.r2.accountId}.r2.cloudflarestorage.com/${bucketName()}/${key}`;
};

export const createTempKeyForUpload = (contentType) => {
  const ext = extFromContentType(contentType);
  if (!ext) {
    const err = new Error('Unsupported content type');
    err.statusCode = 400;
    throw err;
  }

  const ts = Date.now();
  const rand = crypto.randomBytes(8).toString('hex');
  return `temp/${ts}-${rand}.${ext}`;
};

export const createSignedPutUrl = async ({ key, contentType }) => {
  const client = r2Client();
  const Bucket = bucketName();

  const cmd = new PutObjectCommand({
    Bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, cmd, {
    expiresIn: config.r2.signedUrlExpiresInSeconds,
  });

  return { uploadUrl };
};

export const deleteObject = async (key) => {
  const client = r2Client();
  const Bucket = bucketName();

  await client.send(
    new DeleteObjectCommand({
      Bucket,
      Key: key,
    }),
  );
};

export const moveTempObjectToTeam = async ({ key, teamId }) => {
  if (!key?.startsWith('temp/')) return { key, fileUrl: buildPublicFileUrl(key) };
  const client = r2Client();
  const Bucket = bucketName();

  const filename = key.split('/').pop();
  const destKey = `teams/${teamId}/${filename}`;

  await client.send(
    new CopyObjectCommand({
      Bucket,
      CopySource: `/${Bucket}/${key}`,
      Key: destKey,
    }),
  );
  await client.send(new DeleteObjectCommand({ Bucket, Key: key }));

  return { key: destKey, fileUrl: buildPublicFileUrl(destKey) };
};

export const moveTempObjectToPlayer = async ({ key, playerId }) => {
  if (!key?.startsWith('temp/')) return { key, fileUrl: buildPublicFileUrl(key) };
  const client = r2Client();
  const Bucket = bucketName();

  const filename = key.split('/').pop();
  const destKey = `players/${playerId}/${filename}`;

  await client.send(
    new CopyObjectCommand({
      Bucket,
      CopySource: `/${Bucket}/${key}`,
      Key: destKey,
    }),
  );
  await client.send(new DeleteObjectCommand({ Bucket, Key: key }));

  return { key: destKey, fileUrl: buildPublicFileUrl(destKey) };
};

export const moveTempObjectToNews = async ({ key, newsId }) => {
  if (!key?.startsWith('temp/')) return { key, fileUrl: buildPublicFileUrl(key) };
  const client = r2Client();
  const Bucket = bucketName();

  const filename = key.split('/').pop();
  const destKey = `news/${newsId}/${filename}`;

  await client.send(
    new CopyObjectCommand({
      Bucket,
      CopySource: `/${Bucket}/${key}`,
      Key: destKey,
    }),
  );
  await client.send(new DeleteObjectCommand({ Bucket, Key: key }));

  return { key: destKey, fileUrl: buildPublicFileUrl(destKey) };
};

export const cleanupOldTempObjects = async ({ olderThanHours = 24, maxKeys = 1000 } = {}) => {
  const client = r2Client();
  const Bucket = bucketName();
  const cutoff = Date.now() - Number(olderThanHours) * 60 * 60 * 1000;

  let ContinuationToken = undefined;
  let deleted = 0;
  let scanned = 0;

  // Simple paginated scan; safe to run periodically (e.g. cron).
  while (true) {
    const out = await client.send(
      new ListObjectsV2Command({
        Bucket,
        Prefix: 'temp/',
        MaxKeys: maxKeys,
        ContinuationToken,
      }),
    );

    const items = out.Contents || [];
    scanned += items.length;

    for (const obj of items) {
      const key = obj.Key;
      const lastModified = obj.LastModified?.getTime?.() ?? 0;
      if (!key) continue;
      if (lastModified && lastModified < cutoff) {
        await client.send(new DeleteObjectCommand({ Bucket, Key: key }));
        deleted += 1;
      }
    }

    if (!out.IsTruncated) break;
    ContinuationToken = out.NextContinuationToken;
    if (!ContinuationToken) break;
  }

  return { scanned, deleted, olderThanHours: Number(olderThanHours) };
};

