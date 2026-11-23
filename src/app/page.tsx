import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import CarCard from "@/components/CarCard";

// Home page: hero + the cars Yebbie has chosen to feature.
export default async function Home() {
  const featured = await prisma.car.findMany({
    where: {
      status: "AVAILABLE",
      featured: true,
      media: { some: { type: "IMAGE" } }, // a card needs a photo
    },
    include: {
      media: { where: { type: "IMAGE" }, orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <h1 className="max-w-3xl font-sign text-5xl font-bold leading-[1.05] text-ink md:text-7xl">
          Find your next car
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          Browse Yebbie&apos;s cars for sale with photos and walk-around videos, then call or WhatsApp us to buy.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/cars"
            className="rounded-md bg-marking px-6 py-3 font-sign text-xl font-semibold text-road hover:bg-marking-dark"
          >
            See cars for sale
          </Link>
          <a
            href={`https://wa.me/${site.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border-2 border-road px-6 py-3 font-sign text-xl font-semibold text-road hover:bg-road hover:text-white"
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-sign text-4xl font-bold text-ink">Featured cars</h2>
            <Link href="/cars" className="font-sign text-lg font-semibold text-muted hover:text-ink">
              See all cars →
            </Link>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
