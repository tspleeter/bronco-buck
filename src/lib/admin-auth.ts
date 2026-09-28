import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

// Server-only admin gate for /orders, /discounts and their API routes.
//
// FAILS CLOSED: there is NO hardcoded fallback password. The password comes
// from the ORDERS_PASSWORD env var if it reaches the runtime, otherwise from
// SSM at ADMIN_PASSWORD_PARAM (SecureString, read by bronco-buck-compute-role —
// Amplify console env vars do not reach SSR, so SSM is the real source). If
// neither is available, every admin request is rejected.
//
// The auth cookie holds a SHA-256 digest of the password, never the password.

export const ADMIN_COOKIE_NAME = "orders_auth";
export const ADMIN_PASSWORD_PARAM = "/bronco-buck/orders-password";

const ssm = new SSMClient({ region: "us-east-1" });

let cachedPassword: string | null = null;
let lastFailureAt = 0;
const RETRY_AFTER_MS = 60_000;

export async function getAdminPassword(): Promise<string | null> {
  const fromEnv = process.env.ORDERS_PASSWORD?.trim();
  if (fromEnv) return fromEnv;
  if (cachedPassword) return cachedPassword;
  if (Date.now() - lastFailureAt < RETRY_AFTER_MS) return null;

  try {
    const res = await ssm.send(
      new GetParameterCommand({ Name: ADMIN_PASSWORD_PARAM, WithDecryption: true })
    );
    const value = res.Parameter?.Value?.trim();
    if (value) {
      cachedPassword = value;
      return value;
    }
  } catch (err) {
    console.error("Admin password unavailable from SSM:", err);
  }
  lastFailureAt = Date.now();
  return null;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Cookie value for a given password (digest, not the password itself). */
export async function adminCookieValue(password: string): Promise<string> {
  return sha256Hex(`bronco-buck-admin:${password}`);
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** True only when a password is configured AND the submitted one matches. */
export async function checkAdminPassword(submitted: unknown): Promise<boolean> {
  const password = await getAdminPassword();
  if (!password || typeof submitted !== "string") return false;
  return safeEqual(await adminCookieValue(submitted), await adminCookieValue(password));
}

type CookieReader = { cookies: { get(name: string): { value: string } | undefined } };

/** True only when a password is configured AND the request's cookie matches it. */
export async function isAdminRequest(req: CookieReader): Promise<boolean> {
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!cookie) return false;
  const password = await getAdminPassword();
  if (!password) return false;
  return safeEqual(cookie, await adminCookieValue(password));
}
