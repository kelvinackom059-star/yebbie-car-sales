import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { formatCedis } from "@/lib/money";
import { options } from "@/lib/car-form";
import { site, formatPhone } from "@/lib/site";
import CarGallery from "@/components/CarGallery";
import EnquiryForm from "./EnquiryForm";
import { createInquiry } from "./actions";

// cache(): generateMetadata and the page both need the car, but we only
// want to hit the database once per visit.
const getCar = cache((id: string) =>
  prisma.car.findUnique({
    where: { id },
    include: { media: { orderBy: { position: "asc" } } },
  }),
);

type Props = { params: Promise<{ id: string }> };

// Sets the browser tab title, e.g. "2019 Honda Civic | Yebbie"
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCar((await params).id);
  return { title: car ? `${car.year} ${car.make} ${car.model}` : "Car not found" };
}

export default async function CarDetailPage({ params }: Props) {
  const { id } = await params;
  const car = await getCar(id);

  // Customers only see cars that have at least one photo
  if (!car || !car.media.some((m) => m.type === "IMAGE")) notFound();

  const name = `${car.year} ${car.make} ${car.model}`;
  const available = car.status === "AVAILABLE";

  // Put a photo first in the gallery even if a video is at position 0
  const gallery = [...car.media.filter((m) => m.type === "IMAGE"), ...car.media.filter((m) => m.type === "VIDEO")].map(
    (m) => ({ id: m.id, type: m.type, url: m.url }),
  );

  // WhatsApp link with the message already typed in
  const whatsappText = encodeURIComponent(`Hello Yebbie, I'm interested in the ${name} I saw on your website.`);
  const whatsappUrl = `https://wa.me/${site.whatsapp}?text=${whatsappText}`;

  const specs = [
    { label: "Year", value: car.year },
    { label: "Mileage", value: `${car.mileage.toLocaleString("en-GH")} km` },
    { label: "Transmission", value: options.transmission[car.transmission] },
    { label: "Fuel", value: options.fuelType[car.fuelType] },
    { label: "Body", value: options.bodyType[car.bodyType] },
    { label: "Seats", value: car.seats },
    { label: "Colour", value: car.color },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/cars" className="font-semibold text-muted hover:text-ink">
        ← All cars
      </Link>

      <div className="mt-4 grid gap-10 lg:grid-cols-[3fr_2fr]">
        {/* LEFT: gallery, description, specs */}
        <div className="min-w-0">
          <CarGallery items={gallery} carName={name} />

          {car.description && <p className="mt-8 max-w-prose text-lg leading-relaxed">{car.description}</p>}

          <h2 className="mt-10 font-sign text-3xl font-bold">Details</h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 sm:grid-cols-3">
            {specs.map((s) => (
              <div key={s.label} className="border-t border-line py-3">
                <dt className="text-sm text-muted">{s.label}</dt>
                <dd className="font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* RIGHT: name, prices and actions; stays in view while scrolling on desktop */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <h1 className="font-sign text-5xl font-bold leading-none">{car.make} {car.model}</h1>
          <p className="mt-2 text-lg text-muted">{car.year} · {options.transmission[car.transmission]} · {options.fuelType[car.fuelType]}</p>

          {!available && (
            <p role="status" className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
              This car is {options.status[car.status].toLowerCase()} right now. Call us to ask about similar cars.
            </p>
          )}

          {available && (
            <div className="mt-6 rounded-lg border border-line bg-white p-5">
              <h2 className="font-sign text-2xl font-bold">Buy this car</h2>
              <p className="mt-2 font-sign text-4xl font-bold tabular-nums">
                {car.salePrice !== null ? formatCedis(car.salePrice) : "Call for price"}
              </p>
              <p className="mt-2 text-sm text-muted">Ask us about a test drive, inspection or payment.</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-road px-4 py-3 text-center font-sign text-xl font-semibold text-white hover:bg-road-dark"
                >
                  Ask on WhatsApp
                </a>
                <a
                  href={`tel:${site.phones[0]}`}
                  className="rounded-md border-2 border-road px-4 py-3 text-center font-sign text-xl font-semibold hover:bg-road hover:text-white"
                >
                  Call {formatPhone(site.phones[0])}
                </a>
              </div>
            </div>
          )}
        </aside>
      </div>

      <div className="mt-12 max-w-2xl">
        <h2 className="font-sign text-3xl font-bold">Enquire about this car</h2>
        <p className="mt-1 text-muted">Send us a message and we&apos;ll call or WhatsApp you back.</p>
        <div className="mt-4 rounded-lg border border-line bg-white p-5">
          <EnquiryForm action={createInquiry.bind(null, car.id)} />
        </div>
      </div>
    </section>
  );
}
