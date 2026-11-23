import Image from "next/image";
import Link from "next/link";
import type { Car, CarMedia } from "@/generated/prisma/client";
import { formatCedis } from "@/lib/money";
import { photoUrl } from "@/lib/media-url";

// A car plus its cover photo (if it has one).
type CarWithCover = Car & { media: CarMedia[] };

// Turns "AUTOMATIC" into "Automatic"
const nice = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();

export default function CarCard({ car }: { car: CarWithCover }) {
  const cover = car.media[0];

  return (
    <Link
      href={`/cars/${car.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-white transition-colors hover:border-road"
    >
      {/* Photo — or a placeholder until real photos are uploaded */}
      <div className="relative aspect-[4/3] bg-road">
        {cover ? (
          <Image
            src={photoUrl(cover.url, 800)}
            alt={`${car.year} ${car.make} ${car.model}`}
            fill
            unoptimized
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-white/50">
            <Image src="/brand/yebbie-emblem.png" alt="" width={56} height={56} className="opacity-60" />
            <span className="text-sm">Photos coming soon</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h2 className="font-sign text-2xl font-bold leading-tight text-ink group-hover:text-road">
            {car.make} {car.model}
          </h2>
          <p className="text-sm text-muted">
            {car.year} · {nice(car.transmission)} · {nice(car.fuelType)} · {car.seats} seats
          </p>
        </div>

        {/* Price pinned to the bottom so cards line up */}
        <dl className="mt-auto border-t border-line pt-3">
          <dt className="text-xs text-muted">Price</dt>
          <dd className="font-sign text-xl font-bold tabular-nums">
            {car.salePrice !== null ? formatCedis(car.salePrice) : "Call for price"}
          </dd>
        </dl>
      </div>
    </Link>
  );
}
