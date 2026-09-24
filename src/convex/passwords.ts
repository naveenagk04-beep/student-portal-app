/**
 * Password hashing helpers.
 *
 * `hashPasswordSync` is a deterministic demo hash for seeded accounts so the
 * whole demo can share one password without WebCrypto inside mutations.
 */
export function hashPasswordSync(password: string): string {
  let hash = 1;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return `djh${(hash >>> 0).toString(16)}${password.length}`;
}

/** Constant-time-ish comparison of the demo hash. */
export function verifyPasswordSync(
  password: string,
  stored: string,
): boolean {
  try {
    const expected = hashPasswordSync(password);
    if (expected.length !== stored.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ stored.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}
