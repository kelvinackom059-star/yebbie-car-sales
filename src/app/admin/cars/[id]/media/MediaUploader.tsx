"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getUploadSignature, saveMedia } from "./actions";

// Cloudinary free plan limits
const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 100;

type Progress = { name: string; percent: number; error?: string; done?: boolean };

// Uploads ONE file straight from the browser to Cloudinary, reporting progress.
// (fetch() can't report upload progress, so we use XMLHttpRequest.)
function uploadToCloudinary(
  file: File,
  sig: Awaited<ReturnType<typeof getUploadSignature>>,
  onProgress: (percent: number) => void,
): Promise<{ secure_url: string; public_id: string; resource_type: string }> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);

    const xhr = new XMLHttpRequest();
    // "auto" lets Cloudinary detect photo vs video
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      const body = JSON.parse(xhr.responseText || "{}");
      if (xhr.status >= 200 && xhr.status < 300) resolve(body);
      else reject(new Error(body?.error?.message ?? `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Network error. Check your internet connection."));
    xhr.send(form);
  });
}

export default function MediaUploader({ carId }: { carId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setBusy(true);
    setProgress(list.map((f) => ({ name: f.name, percent: 0 })));

    const update = (i: number, patch: Partial<Progress>) =>
      setProgress((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

    try {
      const sig = await getUploadSignature(); // one signature for the whole batch

      // Upload one at a time, so a slow connection isn't overloaded
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");
        const sizeMb = file.size / (1024 * 1024);

        if (!isVideo && !isImage) {
          update(i, { error: "Not a photo or video" });
          continue;
        }
        if (isImage && sizeMb > MAX_IMAGE_MB) {
          update(i, { error: `Photo is ${sizeMb.toFixed(0)} MB, max ${MAX_IMAGE_MB} MB` });
          continue;
        }
        if (isVideo && sizeMb > MAX_VIDEO_MB) {
          update(i, { error: `Video is ${sizeMb.toFixed(0)} MB, max ${MAX_VIDEO_MB} MB. Trim it shorter.` });
          continue;
        }

        try {
          const result = await uploadToCloudinary(file, sig, (percent) => update(i, { percent }));
          await saveMedia(carId, {
            type: result.resource_type === "video" ? "VIDEO" : "IMAGE",
            url: result.secure_url,
            publicId: result.public_id,
          });
          update(i, { percent: 100, done: true });
        } catch (err) {
          update(i, { error: err instanceof Error ? err.message : "Upload failed" });
        }
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = ""; // allow picking the same file again
      router.refresh(); // show the new files in the gallery
    }
  }

  return (
    <div className="rounded-lg border-2 border-dashed border-line bg-white p-6">
      <label htmlFor="media-files" className="block font-sign text-2xl font-bold">
        Add photos and videos
      </label>
      <p className="mt-1 text-muted">
        Photos up to {MAX_IMAGE_MB} MB. For walk-around videos, use the YouTube link box below — it&apos;s free and
        keeps our media costs down. You can also upload short clips up to {MAX_VIDEO_MB} MB. Select several files at
        once if you like.
      </p>
      <input
        ref={inputRef}
        id="media-files"
        type="file"
        multiple
        accept="image/*,video/*"
        disabled={busy}
        onChange={(e) => handleFiles(e.target.files)}
        className="mt-4 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-marking file:px-4 file:py-2.5 file:font-sign file:text-lg file:font-semibold file:text-road hover:file:bg-marking-dark disabled:opacity-60"
      />

      {progress.length > 0 && (
        <ul className="mt-5 space-y-3" aria-live="polite">
          {progress.map((p, i) => (
            <li key={i}>
              <div className="flex justify-between gap-4 text-sm">
                <span className="truncate">{p.name}</span>
                <span className={p.error ? "text-red-700" : "text-muted"}>
                  {p.error ? p.error : p.done ? "Uploaded" : `${p.percent}%`}
                </span>
              </div>
              {!p.error && (
                <div className="mt-1 h-1.5 overflow-hidden rounded bg-line">
                  <div className="h-full bg-road transition-[width]" style={{ width: `${p.percent}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
