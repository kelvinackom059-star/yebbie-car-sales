import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isYoutubeUrl, photoUrl, videoPoster } from "@/lib/media-url";
import MediaUploader from "./MediaUploader";
import VideoLinkForm from "./VideoLinkForm";
import { addVideoLink, deleteMedia, makeCover } from "./actions";

export const metadata: Metadata = { title: "Photos and videos" };

export default async function CarMediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { id } = await params;
  const { new: isNew } = await searchParams;

  const car = await prisma.car.findUnique({
    where: { id },
    include: { media: { orderBy: { position: "asc" } } },
  });
  if (!car) notFound();

  const photos = car.media.filter((m) => m.type === "IMAGE");
  const coverId = photos[0]?.id; // the first photo is the cover

  return (
    <>
      <Link href="/admin/cars" className="font-semibold text-muted hover:text-ink">
        ← All cars
      </Link>
      <h1 className="mt-3 font-sign text-5xl font-bold">
        {car.year} {car.make} {car.model}
      </h1>

      {isNew && (
        <p role="status" className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-900">
          Car saved. Now add its photos. Customers only see the car once it has at least one photo.
        </p>
      )}
      {photos.length === 0 && !isNew && (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          This car has no photos yet, so customers can&apos;t see it. Add at least one photo.
        </p>
      )}

      <div className="mt-6 max-w-3xl">
        <MediaUploader carId={car.id} />
      </div>

      <div className="mt-4 max-w-3xl">
        <VideoLinkForm action={addVideoLink.bind(null, car.id)} />
      </div>

      <h2 className="mt-10 font-sign text-3xl font-bold">
        Gallery <span className="text-muted">({car.media.length})</span>
      </h2>
      <p className="text-muted">The cover photo is shown on the listings page.</p>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {car.media.map((m) => (
          <li key={m.id} className="overflow-hidden rounded-lg border border-line bg-white">
            <div className="relative aspect-[4/3] bg-road">
              {m.type === "IMAGE" ? (
                <Image src={photoUrl(m.url, 600)} alt="" fill unoptimized className="object-cover" />
              ) : isYoutubeUrl(m.url) ? (
                <Image src={videoPoster(m.url)} alt="" fill unoptimized className="object-cover" />
              ) : (
                <video src={m.url} poster={videoPoster(m.url)} controls preload="metadata" className="h-full w-full object-contain" />
              )}
              <span className="absolute left-2 top-2 rounded bg-white px-2 py-0.5 text-sm font-semibold">
                {m.id === coverId ? "Cover" : m.type === "VIDEO" ? "Video" : "Photo"}
              </span>
            </div>
            <div className="flex justify-between gap-3 p-3 text-sm">
              {m.type === "IMAGE" && m.id !== coverId ? (
                <form action={makeCover.bind(null, m.id)}>
                  <button type="submit" className="font-semibold hover:underline">
                    Make cover
                  </button>
                </form>
              ) : (
                <span />
              )}
              <form action={deleteMedia.bind(null, m.id)}>
                <button type="submit" className="font-semibold text-red-700 hover:underline">
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
