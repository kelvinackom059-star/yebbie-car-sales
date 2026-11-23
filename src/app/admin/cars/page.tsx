import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatCedis } from "@/lib/money";
import { options } from "@/lib/car-form";
import DeleteCarButton from "./DeleteCarButton";

export const metadata: Metadata = { title: "Manage cars" };

// Messages shown after an action redirects back here
const notices: Record<string, { text: string; tone: "ok" | "error" }> = {
  saved: { text: "Car saved.", tone: "ok" },
  deleted: { text: "Car removed.", tone: "ok" },
};

const statusStyle: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-900",
  RESERVED: "bg-amber-100 text-amber-900",
  SOLD: "bg-zinc-200 text-zinc-800",
  MAINTENANCE: "bg-red-100 text-red-900",
};

export default async function AdminCarsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const params = await searchParams;
  const notice = params.saved ? notices.saved : params.deleted ? notices.deleted : null;

  // Admin sees ALL cars, whatever their status
  const cars = await prisma.car.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { media: true } },
      media: { where: { type: "IMAGE" }, select: { id: true }, take: 1 }, // has at least one photo?
    },
  });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-sign text-5xl font-bold">Cars</h1>
          <p className="mt-1 text-muted">{cars.length} in total</p>
        </div>
        <Link
          href="/admin/cars/new"
          className="rounded-md bg-marking px-5 py-2.5 font-sign text-xl font-semibold text-road hover:bg-marking-dark"
        >
          Add a car
        </Link>
      </div>

      {notice && (
        <p
          role="status"
          className={`mt-6 rounded-md border px-4 py-3 ${
            notice.tone === "ok" ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {notice.text}
        </p>
      )}

      {/* Wide table scrolls sideways on phones instead of breaking the page */}
      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[640px] text-left">
          <thead className="border-b border-line bg-paper text-sm text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Car</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Photos &amp; videos</th>
              <th className="px-4 py-3 font-medium"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {cars.map((car) => {
              const name = `${car.year} ${car.make} ${car.model}`;
              return (
                <tr key={car.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-semibold">
                      {name} {car.featured && <span title="Featured" className="text-marking-dark">★</span>}
                    </p>
                    <p className="text-sm text-muted">{car.plateNumber ?? "No plate"} · {car.color}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {car.salePrice !== null ? formatCedis(car.salePrice) : <span className="text-muted">Call for price</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-sm font-medium ${statusStyle[car.status]}`}>
                      {options.status[car.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Link href={`/admin/cars/${car.id}/media`} className="font-semibold hover:underline">
                      {car._count.media} {car._count.media === 1 ? "file" : "files"}
                    </Link>
                    {car.media.length === 0 && <p className="text-amber-800">No photo: hidden from customers</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-4">
                      <Link href={`/admin/cars/${car.id}/edit`} className="font-semibold hover:underline">
                        Edit
                      </Link>
                      <DeleteCarButton carId={car.id} carName={name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
