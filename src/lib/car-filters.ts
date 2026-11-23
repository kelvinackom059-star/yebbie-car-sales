import { Prisma } from "@/generated/prisma/client";
import { BodyType, FuelType, Transmission } from "@/generated/prisma/enums";

// Everything the /cars page uses to search, filter, sort and paginate.
// Kept out of the page so the page stays easy to read.

export const PAGE_SIZE = 9;

export const sortOptions = {
  newest: "Newest first",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "mileage-asc": "Lowest mileage",
} as const;

export type SortKey = keyof typeof sortOptions;

export type CarFilters = {
  q: string;
  body: BodyType | "";
  fuel: FuelType | "";
  transmission: Transmission | "";
  minPrice: string; // raw cedis text, kept so the form can show what was typed
  maxPrice: string;
  sort: SortKey;
  page: number;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

function isEnum<T extends Record<string, string>>(obj: T, value: string | undefined): value is T[keyof T] {
  return !!value && Object.values(obj).includes(value);
}

// "1,200" → 120000 pesewas. Anything invalid becomes null (filter ignored).
function parseCedis(raw: string | undefined): number | null {
  const cleaned = (raw ?? "").replace(/,/g, "").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function parseCarFilters(params: RawSearchParams): CarFilters {
  const sortRaw = one(params.sort);
  const pageRaw = Number(one(params.page));

  return {
    q: (one(params.q) ?? "").trim().slice(0, 60),
    body: isEnum(BodyType, one(params.body)) ? (one(params.body) as BodyType) : "",
    fuel: isEnum(FuelType, one(params.fuel)) ? (one(params.fuel) as FuelType) : "",
    transmission: isEnum(Transmission, one(params.transmission))
      ? (one(params.transmission) as Transmission)
      : "",
    minPrice: (one(params.minPrice) ?? "").trim(),
    maxPrice: (one(params.maxPrice) ?? "").trim(),
    sort: sortRaw && sortRaw in sortOptions ? (sortRaw as SortKey) : "newest",
    page: Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  };
}

export function buildCarWhere(filters: CarFilters): Prisma.CarWhereInput {
  const where: Prisma.CarWhereInput = {
    status: "AVAILABLE",
    media: { some: { type: "IMAGE" } }, // customers only see cars with a photo
  };

  if (filters.q) {
    where.OR = [
      { make: { contains: filters.q } },
      { model: { contains: filters.q } },
    ];
  }
  if (filters.body) where.bodyType = filters.body;
  if (filters.fuel) where.fuelType = filters.fuel;
  if (filters.transmission) where.transmission = filters.transmission;

  const min = parseCedis(filters.minPrice);
  const max = parseCedis(filters.maxPrice);
  if (min !== null || max !== null) {
    const priceFilter: Prisma.IntNullableFilter = {};
    if (min !== null) priceFilter.gte = min;
    if (max !== null) priceFilter.lte = max;
    where.salePrice = priceFilter;
  }

  return where;
}

export function buildCarOrderBy(sort: SortKey): Prisma.CarOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ salePrice: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }];
    case "price-desc":
      return [{ salePrice: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }];
    case "mileage-asc":
      return [{ mileage: "asc" }, { createdAt: "desc" }];
    default:
      return [{ featured: "desc" }, { createdAt: "desc" }];
  }
}

// Builds a /cars URL from the current filters, changing only what you pass in.
export function carsHref(filters: CarFilters, overrides: Partial<CarFilters> = {}) {
  const f = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (f.q) params.set("q", f.q);
  if (f.body) params.set("body", f.body);
  if (f.fuel) params.set("fuel", f.fuel);
  if (f.transmission) params.set("transmission", f.transmission);
  if (f.minPrice) params.set("minPrice", f.minPrice);
  if (f.maxPrice) params.set("maxPrice", f.maxPrice);
  if (f.sort !== "newest") params.set("sort", f.sort);
  if (f.page > 1) params.set("page", String(f.page));

  const query = params.toString();
  return query ? `/cars?${query}` : "/cars";
}

export function hasFilters(filters: CarFilters) {
  return Boolean(
    filters.q ||
      filters.body ||
      filters.fuel ||
      filters.transmission ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.sort !== "newest",
  );
}
