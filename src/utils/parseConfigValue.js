/**
 * Parse a stored config string into boolean when it is a boolean literal.
 * @param {string} str
 * @returns {boolean | string}
 */
export function parseStoredBoolean(str) {
  if (typeof str !== 'string') {
    return str;
  }
  const s = str.trim().toLowerCase();
  if (s === 'true') {
    return true;
  }
  if (s === 'false') {
    return false;
  }
  return str;
}

/**
 * Normalize a value for persistence (booleans → "true" / "false").
 * @param {boolean | string} value
 * @returns {string}
 */
export function stringifyConfigValue(value) {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return String(value);
}
