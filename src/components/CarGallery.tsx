"use client";

import { useState } from "react";
import Image from "next/image";
import { photoUrl, videoPoster, videoStream, youtubeEmbedUrl } from "@/lib/media-url";

type GalleryItem = { id: string; type: "IMAGE" | "VIDEO"; url: string };

// Big viewer on top, thumbnails underneath. Clicking a thumbnail shows it.
// Client component because it remembers which item is selected (useState).
export default function CarGallery({ items, carName }: { items: GalleryItem[]; carName: string }) {
  const [index, setIndex] = useState(0);
  const current = items[index];

  if (!current) return null;

  // YouTube links play in an iframe; uploaded videos use a <video> tag.
  const embedUrl = current.type === "VIDEO" ? youtubeEmbedUrl(current.url) : null;

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-road">
        {current.type === "IMAGE" ? (
          <Image
            key={current.id}
            src={photoUrl(current.url, 1600)}
            alt={`${carName}, photo ${index + 1} of ${items.length}`}
            fill
            unoptimized // Cloudinary already resizes and compresses it
            priority={index === 0}
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-contain"
          />
        ) : embedUrl ? (
          <iframe
            key={current.id}
            src={embedUrl}
            title={`${carName} video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <video
            key={current.id}
            src={videoStream(current.url)}
            poster={videoPoster(current.url)}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
          >
            Your browser can&apos;t play this video.
          </video>
        )}
        <span className="absolute bottom-3 right-3 rounded bg-road/80 px-2 py-0.5 text-sm text-white tabular-nums">
          {index + 1} / {items.length}
        </span>
      </div>

      {items.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Choose a photo or video">
          {items.map((item, i) => (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${item.type === "VIDEO" ? "Video" : "Photo"} ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={`relative block h-16 w-24 overflow-hidden rounded-md border-2 bg-road ${
                  i === index ? "border-marking" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={item.type === "VIDEO" ? videoPoster(item.url) : photoUrl(item.url, 200)}
                  alt=""
                  fill
                  unoptimized
                  sizes="96px"
                  className="object-cover"
                />
                {item.type === "VIDEO" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-road/40 text-xs font-semibold text-white">
                    ▶ Video
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
