import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminDashboard() {
  // Run the counts at the same time instead of one after another
  const [cars, forSale, sold, newInquiries] = await Promise.all([
    prisma.car.count(),
    prisma.car.count({ where: { status: "AVAILABLE" } }),
    prisma.car.count({ where: { status: "SOLD" } }),
    prisma.inquiry.count({ where: { status: "NEW" } }),
  ]);

  return (
    <>
      <h1 className="font-sign text-5xl font-bold">Dashboard</h1>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Cars in total", value: cars },
          { label: "For sale now", value: forSale },
          { label: "Sold", value: sold },
          { label: "New enquiries", value: newInquiries },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-line bg-white p-5">
            <dt className="text-muted">{stat.label}</dt>
            <dd className="font-sign text-4xl font-bold tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/admin/cars"
          className="inline-block rounded-md bg-marking px-5 py-2.5 font-sign text-xl font-semibold text-road hover:bg-marking-dark"
        >
          Manage cars
        </Link>
        <Link
          href="/admin/inquiries"
          className="inline-block rounded-md border-2 border-road px-5 py-2.5 font-sign text-xl font-semibold hover:bg-road hover:text-white"
        >
          View enquiries
        </Link>
      </div>
    </>
  );
}
