// TODO: use UUID v4 instead, and eventually add nanoid for user-facing IDs
/**
 * Generates a cryptographically secure, random hexadecimal string of a specified length.
 *
 * @param {number} [length=12] The desired length of the resulting hex string (in characters).
 * @returns {string} The primary key hex string, truncated to the desired length.
 */
export const generatePrimaryKey = (length = 12) => {
  // 1. Calculate the number of bytes needed.
  // Each byte generates 2 hex characters, so we need: ceil(length / 2) bytes.
  const bytesNeeded = Math.ceil(length / 2);

  // 2. Generate the random bytes.
  const bytes = new Uint8Array(bytesNeeded);
  crypto.getRandomValues(bytes);

  // 3. Convert bytes to a full hex string (which may be slightly longer than `length`).
  const fullHexString = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');

  // 4. Truncate the resulting string to the exact requested length.
  return fullHexString.slice(0, length);
};
