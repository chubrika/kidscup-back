import { Config } from '../models/Config.js';
import { parseStoredBoolean, stringifyConfigValue } from '../utils/parseConfigValue.js';

/** Keys returned by GET /config (never add secrets here). */
export const PUBLIC_CONFIG_KEYS = ['team_registration_enabled', 'maintenance_mode'];

const BOOLEAN_PUBLIC_KEYS = new Set(PUBLIC_CONFIG_KEYS);

const DEFAULT_PUBLIC_PARSED = {
  team_registration_enabled: true,
  maintenance_mode: false,
};

/**
 * Public-safe config object with booleans coerced from stored strings.
 */
export async function getPublicConfigObject() {
  const rows = await Config.find({ key: { $in: PUBLIC_CONFIG_KEYS } }).lean();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const out = {};
  for (const key of PUBLIC_CONFIG_KEYS) {
    const stored = map[key];
    const fallback = DEFAULT_PUBLIC_PARSED[key];
    if (stored === undefined || stored === null) {
      out[key] = fallback;
      continue;
    }
    if (BOOLEAN_PUBLIC_KEYS.has(key)) {
      const parsed = parseStoredBoolean(stored);
      out[key] = typeof parsed === 'boolean' ? parsed : fallback;
    } else {
      out[key] = stored;
    }
  }
  return out;
}

/**
 * Upsert a config row (admin). Any key allowed; only PUBLIC_CONFIG_KEYS are exposed publicly.
 * @param {string} key
 * @param {boolean | string} value
 */
export async function upsertConfig(key, value) {
  const str = stringifyConfigValue(value);
  await Config.findOneAndUpdate(
    { key },
    { $set: { key, value: str } },
    { upsert: true, new: true, runValidators: true },
  );
}
