export const SESSION_COOKIE = "pulse_session";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** null when DASHBOARD_PASSWORD isn't configured — the whole app stays gated
 * behind the setup screen until it is, rather than defaulting to open. */
export async function expectedSessionToken(): Promise<string | null> {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return null;
  return sha256Hex(`pulse-session:${password}`);
}

export async function verifyPassword(input: string): Promise<boolean> {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return false;
  return input === password;
}
