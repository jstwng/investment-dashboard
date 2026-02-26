/**
 * SnapTrade API client for Supabase Edge Functions (Deno runtime).
 * Implements HMAC-SHA256 request signing per SnapTrade specification.
 * No npm imports — uses Deno built-ins only.
 */

const BASE_URL = "https://api.snaptrade.com/api/v1";

// ---------------------------------------------------------------------------
// SnapTradeError
// ---------------------------------------------------------------------------

export class SnapTradeError extends Error {
  constructor(public errorCode: string, message: string) {
    super(message);
    this.name = "SnapTradeError";
  }
}

// ---------------------------------------------------------------------------
// HMAC-SHA256 signing helpers
// ---------------------------------------------------------------------------

/**
 * Sort the keys of a plain object alphabetically and return a new object.
 */
function sortObjectKeys<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)),
  ) as T;
}

/**
 * Build the signature content string as required by SnapTrade:
 *   JSON.stringify({ content, path, query })
 * where the top-level keys are in alphabetical order (content, path, query)
 * and the query object keys are also sorted alphabetically.
 */
function buildSignatureContent(
  requestBodyStr: string,
  endpoint: string,
  queryObj: Record<string, string>,
): string {
  // Sort query keys alphabetically
  const sortedQuery = sortObjectKeys(queryObj);

  // Top-level keys must appear in alphabetical order: content, path, query
  const signaturePayload = {
    content: requestBodyStr,
    path: "/api/v1" + endpoint,
    query: sortedQuery,
  };

  return JSON.stringify(signaturePayload);
}

/**
 * Sign the given content string with HMAC-SHA256 using the consumerKey,
 * then return the result as a base64-encoded string.
 */
async function hmacSha256Base64(
  content: string,
  consumerKey: string,
): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(consumerKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign(
    "HMAC",
    keyMaterial,
    new TextEncoder().encode(content),
  );

  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

// ---------------------------------------------------------------------------
// callSnaptrade
// ---------------------------------------------------------------------------

/**
 * Make an authenticated request to the SnapTrade API.
 *
 * @param endpoint  - Path after `/api/v1`, e.g. `/snapTrade/registerUser`
 * @param method    - HTTP verb (`GET` or `POST`)
 * @param body      - Optional JSON request body
 * @param userId    - Optional SnapTrade userId (required for user-scoped calls)
 * @param userSecret - Optional SnapTrade userSecret (required for user-scoped calls)
 * @returns         - Parsed JSON response typed as T
 */
export async function callSnaptrade<T>(
  endpoint: string,
  method: "GET" | "POST",
  body?: Record<string, unknown>,
  userId?: string,
  userSecret?: string,
): Promise<T> {
  const clientId = Deno.env.get("SNAPTRADE_CLIENT_ID");
  const consumerKey = Deno.env.get("SNAPTRADE_CONSUMER_KEY");

  if (!clientId || !consumerKey) {
    throw new SnapTradeError(
      "MISSING_ENV",
      "SNAPTRADE_CLIENT_ID and SNAPTRADE_CONSUMER_KEY must be set in environment",
    );
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Build query object — include userId/userSecret only when provided
  const queryObj: Record<string, string> = {
    clientId,
    timestamp,
    ...(userId && { userId }),
    ...(userSecret && { userSecret }),
  };

  // Sort query keys alphabetically for both the URL and the signature
  const sortedQueryObj = sortObjectKeys(queryObj);

  // Build query string for the URL
  const queryString = new URLSearchParams(sortedQueryObj).toString();
  const url = `${BASE_URL}${endpoint}?${queryString}`;

  // Serialise request body (empty string when there is no body)
  const requestBodyStr = body ? JSON.stringify(body) : "";

  // Build and sign the signature content
  const signatureContent = buildSignatureContent(
    requestBodyStr,
    endpoint,
    sortedQueryObj,
  );
  const signature = await hmacSha256Base64(signatureContent, consumerKey);

  // Execute the request
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Signature": signature,
    },
    ...(requestBodyStr && { body: requestBodyStr }),
  });

  if (!response.ok) {
    let errorCode = "HTTP_ERROR";
    let errorMessage = `SnapTrade API error: ${response.status} ${response.statusText}`;

    try {
      const errorBody = await response.json();
      if (errorBody?.errorCode) errorCode = errorBody.errorCode;
      if (errorBody?.message) errorMessage = errorBody.message;
      // Some SnapTrade errors use a different shape
      if (errorBody?.detail) errorMessage = errorBody.detail;
    } catch {
      // Response body is not JSON — keep the default message
    }

    throw new SnapTradeError(errorCode, errorMessage);
  }

  return response.json() as Promise<T>;
}
