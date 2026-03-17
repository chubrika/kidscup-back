import { cleanupOldTempObjects } from '../services/r2Service.js';

/**
 * Usage:
 *   node src/scripts/cleanupTempUploads.js
 *
 * Env:
 *   R2_TEMP_TTL_HOURS (default 24)
 *   R2_CLEANUP_MAX_KEYS (default 1000)
 */
const run = async () => {
  const olderThanHours = Number(process.env.R2_TEMP_TTL_HOURS || 24);
  const maxKeys = Number(process.env.R2_CLEANUP_MAX_KEYS || 1000);

  const result = await cleanupOldTempObjects({ olderThanHours, maxKeys });
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
};

run().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});

