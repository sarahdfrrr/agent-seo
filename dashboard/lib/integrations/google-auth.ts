import { google } from "googleapis";
import { requireEnv } from "@/lib/env";

/**
 * Shared Google service-account auth for GA4 (Analytics Data API) and
 * Search Console. Create a service account in Google Cloud Console, enable
 * the relevant APIs, then:
 *  - GA4: add the service account email as a "Viewer" in Admin > Property
 *    access management.
 *  - Search Console: add it as a user in Settings > Users and permissions.
 *
 * Env vars:
 *  GOOGLE_SERVICE_ACCOUNT_EMAIL
 *  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY   (paste with literal \n line breaks)
 */
export function getGoogleAuth(scopes: string[]) {
  const email = requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = requireEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes,
  });
}
