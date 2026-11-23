// Cloudinary can resize and compress a file just by changing its URL.
// e.g. .../upload/v123/car.jpg  →  .../upload/q_auto,w_800/v123/car.jpg
// q_auto = best quality for the smallest size, w_800 = 800px wide.
// Safe to use in the browser (no secrets here).

export function cloudinaryUrl(url: string, transform: string) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/${transform}/`);
}

// ─────────────────────────────────────────────
// YouTube
// Walk-around videos can be linked from YouTube instead of uploaded to
// Cloudinary. Video bandwidth is the most expensive part of Cloudinary,
// so this keeps our media bill down. We store the normal watch URL.

export function youtubeId(url: string): string | null {
  const valid = (id: string | null | undefined) =>
    id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") return valid(parsed.pathname.slice(1).split("/")[0]);

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (parsed.pathname === "/watch") return valid(parsed.searchParams.get("v"));
      const match = parsed.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})/);
      return valid(match?.[1]);
    }

    return null;
  } catch {
    return null; // not a URL at all
  }
}

export function isYoutubeUrl(url: string) {
  return youtubeId(url) !== null;
}

export function youtubeThumbnail(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export function youtubeEmbedUrl(url: string): string | null {
  const id = youtubeId(url);
  // youtube-nocookie keeps YouTube from setting tracking cookies until play
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

// A still frame from a video, to show before it plays
export function videoPoster(url: string) {
  const youtube = youtubeThumbnail(url);
  if (youtube) return youtube;
  return cloudinaryUrl(url, "so_1,w_800,q_auto").replace(/\.[a-z0-9]+$/i, ".jpg");
}

// A phone-friendly version of a Cloudinary video (not used for YouTube)
export function videoStream(url: string) {
  return cloudinaryUrl(url, "q_auto,vc_auto,w_1280");
}

// A photo in a format every browser can show (e.g. iPhone .heic → .jpg),
// compressed and no wider than `width` pixels.
// f_auto = best format for the browser, q_auto = smart compression,
// c_limit = shrink big photos but never enlarge small ones.
export function photoUrl(url: string, width: number) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) return url;
  return cloudinaryUrl(url, `f_auto,q_auto,c_limit,w_${width}`).replace(/\.[a-z0-9]+$/i, ".jpg");
}
