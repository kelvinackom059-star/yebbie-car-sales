import { createHash } from "node:crypto";

// HOW SECURE UPLOADS WORK
// The browser uploads files STRAIGHT to Cloudinary (big videos never pass
// through our server). But Cloudinary must know the upload is allowed.
// So our server makes a "signature": a fingerprint of the upload settings
// mixed with the API secret. The browser sends that signature along.
// Cloudinary repeats the same calculation with the secret; if it matches,
// the upload is accepted. The secret itself never leaves the server.

const UPLOAD_FOLDER = "yebbie/cars";

function config() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary keys are missing. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env");
  }
  return { cloudName, apiKey, apiSecret };
}

// Cloudinary's signing rule: sort the parameters A→Z, join as
// "key=value&key=value", add the secret on the end, then SHA-1 it.
export function signParams(params: Record<string, string | number>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(toSign + apiSecret).digest("hex");
}

// Everything the browser needs to upload one batch of files
export function createUploadSignature() {
  const { cloudName, apiKey, apiSecret } = config();
  const timestamp = Math.round(Date.now() / 1000); // Cloudinary rejects signatures older than 1 hour
  const params = { folder: UPLOAD_FOLDER, timestamp };
  return {
    cloudName,
    apiKey,
    folder: UPLOAD_FOLDER,
    timestamp,
    signature: signParams(params, apiSecret),
  };
}

// Only accept URLs that really point to OUR Cloudinary account
export function isOurCloudinaryUrl(url: string) {
  const { cloudName } = config();
  return url.startsWith(`https://res.cloudinary.com/${cloudName}/`);
}

// Delete a file from Cloudinary (used when the admin removes a photo/video)
export async function deleteFromCloudinary(publicId: string, type: "IMAGE" | "VIDEO") {
  const { cloudName, apiKey, apiSecret } = config();
  const timestamp = Math.round(Date.now() / 1000);
  const params = { public_id: publicId, timestamp, invalidate: "true" };
  const body = new URLSearchParams({
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    api_key: apiKey,
    signature: signParams(params, apiSecret),
  });
  const resourceType = type === "VIDEO" ? "video" : "image";
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
    method: "POST",
    body,
  });
  if (!response.ok) {
    // Don't block the admin if Cloudinary is unreachable; the DB row is removed anyway.
    console.error("Cloudinary delete failed", publicId, await response.text());
  }
}
