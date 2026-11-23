"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createUploadSignature, deleteFromCloudinary, isOurCloudinaryUrl } from "@/lib/cloudinary";
import { youtubeId, youtubeThumbnail } from "@/lib/media-url";

function refresh(carId: string) {
  revalidatePath(`/admin/cars/${carId}/media`);
  revalidatePath("/admin/cars");
  revalidatePath("/cars");
  revalidatePath(`/cars/${carId}`);
}

// 1. Before uploading, the browser asks for a signature
export async function getUploadSignature() {
  await requireAdmin();
  return createUploadSignature();
}

export type UploadedFile = {
  type: "IMAGE" | "VIDEO";
  url: string;
  publicId: string;
  thumbnailUrl?: string;
};

// 2. After Cloudinary accepts the file, the browser tells us where it is
export async function saveMedia(carId: string, file: UploadedFile) {
  await requireAdmin();

  // Never trust the browser blindly: check the URL is really ours
  if (!isOurCloudinaryUrl(file.url) || (file.type !== "IMAGE" && file.type !== "VIDEO")) {
    throw new Error("Invalid upload.");
  }

  // New files go to the end of the gallery
  const last = await prisma.carMedia.findFirst({
    where: { carId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await prisma.carMedia.create({
    data: {
      carId,
      type: file.type,
      url: file.url,
      publicId: file.publicId,
      thumbnailUrl: file.thumbnailUrl ?? null,
      position: last ? last.position + 1 : 0,
    },
  });
  refresh(carId);
}

export type VideoLinkState = { error?: string; success?: boolean } | undefined;

// Add a YouTube video by link. YouTube handles the bandwidth, so this is the
// cheap way to show walk-around videos (Cloudinary video delivery is metered).
export async function addVideoLink(
  carId: string,
  _prev: VideoLinkState,
  formData: FormData,
): Promise<VideoLinkState> {
  await requireAdmin();

  const raw = String(formData.get("url") ?? "").trim();
  const id = youtubeId(raw);
  if (!id) return { error: "Paste a valid YouTube link, e.g. https://youtu.be/XXXXXXXXXXX" };

  const car = await prisma.car.findUnique({ where: { id: carId }, select: { id: true } });
  if (!car) return { error: "That car no longer exists." };

  const last = await prisma.carMedia.findFirst({
    where: { carId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await prisma.carMedia.create({
    data: {
      carId,
      type: "VIDEO",
      url: `https://www.youtube.com/watch?v=${id}`, // store a clean, canonical link
      publicId: null, // not a Cloudinary file, so nothing to delete there
      thumbnailUrl: youtubeThumbnail(raw),
      position: last ? last.position + 1 : 0,
    },
  });
  refresh(carId);
  return { success: true };
}

// Make a photo the cover (the one shown on listing cards)
export async function makeCover(mediaId: string) {
  await requireAdmin();
  const media = await prisma.carMedia.findUniqueOrThrow({ where: { id: mediaId } });
  const first = await prisma.carMedia.findFirst({
    where: { carId: media.carId },
    orderBy: { position: "asc" },
    select: { position: true },
  });
  await prisma.carMedia.update({
    where: { id: mediaId },
    data: { position: (first?.position ?? 0) - 1 }, // one before the current first
  });
  refresh(media.carId);
}

export async function deleteMedia(mediaId: string) {
  await requireAdmin();
  const media = await prisma.carMedia.findUniqueOrThrow({ where: { id: mediaId } });
  if (media.publicId) await deleteFromCloudinary(media.publicId, media.type);
  await prisma.carMedia.delete({ where: { id: mediaId } });
  refresh(media.carId);
}
