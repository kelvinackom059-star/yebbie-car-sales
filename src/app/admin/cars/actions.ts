"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parseCarForm, type CarFormState } from "@/lib/car-form";
import { deleteFromCloudinary } from "@/lib/cloudinary";

// IMPORTANT: a server action is a public endpoint. Anyone could call it,
// even without seeing the form. So EVERY action checks requireAdmin() first.

function duplicatePlate(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

// After changing cars, tell Next.js to rebuild the pages that show them
function refreshCarPages() {
  revalidatePath("/cars");
  revalidatePath("/admin");
  revalidatePath("/admin/cars");
}

export async function createCar(_prev: CarFormState, formData: FormData): Promise<CarFormState> {
  await requireAdmin();

  const result = parseCarForm(formData);
  if (!result.ok) return { errors: result.errors, values: result.values };

  let carId: string;
  try {
    const car = await prisma.car.create({ data: result.data });
    carId = car.id;
  } catch (error) {
    if (duplicatePlate(error)) {
      return { errors: { plateNumber: "Another car already has this number plate." }, values: result.values };
    }
    throw error;
  }

  refreshCarPages();
  redirect(`/admin/cars/${carId}/media?new=1`); // next: add photos
}

// carId is "bound" in by the edit page: updateCar.bind(null, car.id)
export async function updateCar(carId: string, _prev: CarFormState, formData: FormData): Promise<CarFormState> {
  await requireAdmin();

  const result = parseCarForm(formData);
  if (!result.ok) return { errors: result.errors, values: result.values };

  try {
    await prisma.car.update({ where: { id: carId }, data: result.data });
  } catch (error) {
    if (duplicatePlate(error)) {
      return { errors: { plateNumber: "Another car already has this number plate." }, values: result.values };
    }
    throw error;
  }

  refreshCarPages();
  redirect("/admin/cars?saved=1");
}

export async function deleteCar(carId: string) {
  await requireAdmin();

  // Delete the files from Cloudinary first, then the car.
  // (The CarMedia rows are deleted automatically by onDelete: Cascade.)
  const media = await prisma.carMedia.findMany({ where: { carId }, select: { publicId: true, type: true } });
  await Promise.all(media.filter((m) => m.publicId).map((m) => deleteFromCloudinary(m.publicId!, m.type)));
  await prisma.car.delete({ where: { id: carId } });
  refreshCarPages();
  redirect("/admin/cars?deleted=1");
}
