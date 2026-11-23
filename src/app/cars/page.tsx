import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { options } from "@/lib/car-form";
import CarCard from "@/components/CarCard";
import {
  PAGE_SIZE,
  buildCarOrderBy,
  buildCarWhere,
  carsHref,
  hasFilters,
  parseCarFilters,
  sortOptions,
} from "@/lib/car-filters";

export const metadata: Metadata = { title: "Cars for sale" };

const labelClass = "flex flex-col gap-1.5 text-sm font-medium";
const controlClass = "rounded-md border border-line bg-white px-3 py-2.5 text-ink outline-none focus:border-road";

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseCarFilters(await searchParams);
  const where = buildCarWhere(filters);

  // Count first so a stale page number can be clamped instead of showing nothing.
  const total = await prisma.car.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const current = { ...filters, page };

  const cars = await prisma.car.findMany({
    where,
    include: {
      // just the cover: the first PHOTO (a video can't be a card image)
      media: { where: { type: "IMAGE" }, orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: buildCarOrderBy(filters.sort),
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-sign text-5xl font-bold text-ink">Cars for sale</h1>

      <form method="get" action="/cars" className="mt-6 rounded-lg border border-line bg-white p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className={`${labelClass} lg:col-span-2`}>
            Search
            <input
              name="q"
              defaultValue={filters.q}
              placeholder="Make or model, e.g. Toyota Corolla"
              className={controlClass}
            />
          </label>

          <label className={labelClass}>
            Body type
            <select name="body" defaultValue={filters.body} className={controlClass}>
              <option value="">Any body type</option>
              {Object.entries(options.bodyType).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Fuel
            <select name="fuel" defaultValue={filters.fuel} className={controlClass}>
              <option value="">Any fuel</option>
              {Object.entries(options.fuelType).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Transmission
            <select name="transmission" defaultValue={filters.transmission} className={controlClass}>
              <option value="">Any transmission</option>
              {Object.entries(options.transmission).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Min price (GH₵)
            <input name="minPrice" inputMode="decimal" defaultValue={filters.minPrice} placeholder="e.g. 100000" className={controlClass} />
          </label>

          <label className={labelClass}>
            Max price (GH₵)
            <input name="maxPrice" inputMode="decimal" defaultValue={filters.maxPrice} placeholder="e.g. 500000" className={controlClass} />
          </label>

          <label className={labelClass}>
            Sort by
            <select name="sort" defaultValue={filters.sort} className={controlClass}>
              {Object.entries(sortOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-marking px-5 py-2.5 font-sign text-lg font-semibold text-road hover:bg-marking-dark"
          >
            Apply filters
          </button>
          {hasFilters(filters) && (
            <Link href="/cars" className="font-semibold text-muted hover:text-ink">
              Clear filters
            </Link>
          )}
        </div>
      </form>

      <p className="mt-6 text-muted">
        {total} {total === 1 ? "car" : "cars"} found
      </p>

      {cars.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-line bg-white p-10 text-center">
          <p className="font-sign text-2xl font-semibold">
            {hasFilters(filters) ? "No cars match those filters" : "No cars here right now"}
          </p>
          <p className="mt-2 text-muted">
            {hasFilters(filters)
              ? "Try widening your search, or clear the filters to see everything."
              : "New cars are added often. Call us to ask what's coming."}
          </p>
          {hasFilters(filters) && (
            <Link href="/cars" className="mt-4 inline-block font-semibold text-road hover:underline">
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-4">
          {page > 1 ? (
            <Link
              href={carsHref(current, { page: page - 1 })}
              className="rounded-md border border-line bg-white px-4 py-2 font-semibold hover:border-road"
            >
              ← Previous
            </Link>
          ) : (
            <span className="rounded-md border border-line bg-white px-4 py-2 font-semibold text-muted opacity-50">
              ← Previous
            </span>
          )}

          <span className="text-sm text-muted">
            Page {page} of {pageCount}
          </span>

          {page < pageCount ? (
            <Link
              href={carsHref(current, { page: page + 1 })}
              className="rounded-md border border-line bg-white px-4 py-2 font-semibold hover:border-road"
            >
              Next →
            </Link>
          ) : (
            <span className="rounded-md border border-line bg-white px-4 py-2 font-semibold text-muted opacity-50">
              Next →
            </span>
          )}
        </nav>
      )}
    </section>
  );
}
