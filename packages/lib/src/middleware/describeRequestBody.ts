/**
 * What the error logger records about a request body instead of the body itself.
 *
 * onError used to log `body: req.body` on every 4xx and 5xx, which put login
 * payloads, OTP codes, wallet signatures and other PII into the logs. The logger
 * now gets the shape of the body (byte length and top-level key names) and never
 * a value. Key names that usually hold a secret are replaced by "redacted" so a
 * key list cannot leak which credential a route accepts.
 */
const SENSITIVE_KEY = /pass|secret|token|key|otp|signature|auth|session|cookie|credential|private/i;

export type RequestBodySummary = {
  /** Byte length of the JSON-serialised body; 0 for an empty or absent body. */
  bytes: number;
  /** Top-level key names, sensitive ones replaced by "redacted". Empty for a non-object body. */
  keys: string[];
};

export function describeRequestBody(body: unknown): RequestBodySummary {
  if (body === undefined || body === null) {
    return { bytes: 0, keys: [] };
  }
  let bytes = 0;
  try {
    bytes = Buffer.byteLength(typeof body === 'string' ? body : JSON.stringify(body));
  } catch {
    bytes = -1; // not serialisable; still never logged
  }
  if (typeof body !== 'object' || Array.isArray(body)) {
    return { bytes, keys: [] };
  }
  const keys = Object.keys(body as Record<string, unknown>).map((k) => (SENSITIVE_KEY.test(k) ? 'redacted' : k));
  return { bytes, keys };
}
