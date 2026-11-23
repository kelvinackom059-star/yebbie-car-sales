import {
  BodyType,
  CarStatus,
  FuelType,
  Transmission,
} from "@/generated/prisma/enums";
import { cedisToPesewas } from "./money";

// Takes the raw form data from the Add/Edit car form, checks it, and turns
// it into data ready for the database. Kept separate from the server action
// so it's easy to read and to test.

export type CarFormState =
  | {
      errors?: Record<string, string>; // field name → message
      message?: string; // error for the whole form
      values?: Record<string, string>; // what they typed, to refill the form
    }
  | undefined;

// Labels shown in dropdowns
export const options = {
  status: {
    AVAILABLE: "Available",
    RESERVED: "Reserved",
    SOLD: "Sold",
    MAINTENANCE: "Under maintenance",
  },
  bodyType: {
    SEDAN: "Sedan",
    SUV: "SUV",
    HATCHBACK: "Hatchback",
    PICKUP: "Pickup",
    VAN: "Van",
    COUPE: "Coupe",
    BUS: "Bus",
  },
  transmission: { AUTOMATIC: "Automatic", MANUAL: "Manual" },
  fuelType: { PETROL: "Petrol", DIESEL: "Diesel", HYBRID: "Hybrid", ELECTRIC: "Electric" },
} as const;

const thisYear = new Date().getFullYear();

function isOneOf<T extends Record<string, string>>(obj: T, value: string): value is T[keyof T] {
  return Object.values(obj).includes(value);
}

export function parseCarForm(formData: FormData) {
  // Read every field as trimmed text
  const v: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") v[key] = value.trim();
  }
  v.featured = formData.get("featured") ? "on" : "";

  const errors: Record<string, string> = {};

  // Whole numbers, e.g. year and seats
  const int = (key: string, label: string, min: number, max: number) => {
    const n = Number(v[key]);
    if (v[key] === undefined || v[key] === "" || !Number.isInteger(n)) {
      errors[key] = `Enter the ${label} as a whole number.`;
    } else if (n < min || n > max) {
      errors[key] = `${label[0].toUpperCase() + label.slice(1)} must be between ${min} and ${max}.`;
    }
    return n;
  };

  // Price in cedis → pesewas. Empty = null, shown as "Call for price".
  const price = (key: string, label: string) => {
    const raw = (v[key] ?? "").replace(/,/g, "");
    if (raw === "") return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      errors[key] = `Enter the ${label} as a number in cedis, e.g. 450.`;
      return null;
    }
    return cedisToPesewas(n);
  };

  if (!v.make) errors.make = "Enter the make, e.g. Toyota.";
  if (!v.model) errors.model = "Enter the model, e.g. Corolla.";
  if (!v.color) errors.color = "Enter the colour.";
  const year = int("year", "year", 1980, thisYear + 1);
  const seats = int("seats", "number of seats", 1, 60);
  const mileage = int("mileage", "mileage", 0, 2_000_000);

  if (!isOneOf(CarStatus, v.status ?? "")) errors.status = "Choose a status.";
  if (!isOneOf(BodyType, v.bodyType ?? "")) errors.bodyType = "Choose a body type.";
  if (!isOneOf(Transmission, v.transmission ?? "")) errors.transmission = "Choose a transmission.";
  if (!isOneOf(FuelType, v.fuelType ?? "")) errors.fuelType = "Choose a fuel type.";

  const salePrice = price("salePrice", "price");

  if (Object.keys(errors).length > 0) {
    return { ok: false as const, errors, values: v };
  }

  return {
    ok: true as const,
    values: v, // kept so the form can be refilled if saving fails later
    data: {
      make: v.make,
      model: v.model,
      year,
      color: v.color,
      plateNumber: v.plateNumber ? v.plateNumber.toUpperCase() : null,
      bodyType: v.bodyType as BodyType,
      transmission: v.transmission as Transmission,
      fuelType: v.fuelType as FuelType,
      seats,
      mileage,
      description: v.description || null,
      status: v.status as CarStatus,
      featured: v.featured === "on",
      salePrice,
    },
  };
}
