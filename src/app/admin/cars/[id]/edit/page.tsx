import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CarForm from "../../CarForm";
import { updateCar } from "../../actions";

export const metadata: Metadata = { title: "Edit car" };

// pesewas → cedis text for the form, e.g. 45000 → "450"
const toCedis = (pesewas: number | null) => (pesewas === null ? "" : String(pesewas / 100));

// [id] in the folder name means this page works for /admin/cars/ANY-ID/edit
export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await prisma.car.findUnique({ where: { id } });
  if (!car) notFound();

  const initial = {
    make: car.make,
    model: car.model,
    year: String(car.year),
    color: car.color,
    plateNumber: car.plateNumber ?? "",
    bodyType: car.bodyType,
    transmission: car.transmission,
    fuelType: car.fuelType,
    seats: String(car.seats),
    mileage: String(car.mileage),
    description: car.description ?? "",
    status: car.status,
    featured: car.featured ? "on" : "",
    salePrice: toCedis(car.salePrice),
  };

  return (
    <>
      <h1 className="font-sign text-5xl font-bold">
        Edit {car.year} {car.make} {car.model}
      </h1>
      <div className="mt-8 max-w-3xl">
        {/* bind() fills in the first argument (the car's id) ahead of time */}
        <CarForm action={updateCar.bind(null, car.id)} initial={initial} submitLabel="Save changes" />
      </div>
    </>
  );
}
