import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPhone } from "@/lib/site";
import { InquiryStatus } from "@/generated/prisma/enums";
import { updateInquiryStatus } from "./actions";

export const metadata: Metadata = { title: "Enquiries" };

const typeLabels: Record<string, string> = {
  PURCHASE: "Purchase",
  TEST_DRIVE: "Test drive",
  GENERAL: "Question",
};

const statusLabels: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CLOSED: "Closed",
};

const statusStyle: Record<string, string> = {
  NEW: "bg-green-100 text-green-900",
  CONTACTED: "bg-amber-100 text-amber-900",
  CLOSED: "bg-zinc-200 text-zinc-800",
};

const niceDate = (date: Date, timeZone = "Africa/Accra") =>
  date.toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric", timeZone });

// 0542517572 → 233542517572 (WhatsApp needs the country code)
const whatsappHref = (phone: string) => {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `233${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
};

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = Object.values(InquiryStatus).includes(status as InquiryStatus)
    ? (status as InquiryStatus)
    : undefined;

  const [inquiries, counts] = await Promise.all([
    prisma.inquiry.findMany({
      where: filter ? { status: filter } : undefined,
      orderBy: { createdAt: "desc" },
      include: { car: { select: { id: true, make: true, model: true, year: true } } },
    }),
    prisma.inquiry.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countFor = (value: InquiryStatus) =>
    counts.find((c) => c.status === value)?._count._all ?? 0;

  const tabs = [
    { label: "All", href: "/admin/inquiries", count: counts.reduce((sum, c) => sum + c._count._all, 0) },
    ...Object.values(InquiryStatus).map((value) => ({
      label: statusLabels[value],
      href: `/admin/inquiries?status=${value}`,
      count: countFor(value),
    })),
  ];

  return (
    <>
      <h1 className="font-sign text-5xl font-bold">Enquiries</h1>
      <p className="mt-1 text-muted">Messages from customers. Call or WhatsApp them, then mark the enquiry.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = tab.href === "/admin/inquiries" ? !filter : filter === tab.href.split("=")[1];
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${
                active ? "border-road bg-road text-white" : "border-line bg-white hover:border-road"
              }`}
            >
              {tab.label} ({tab.count})
            </Link>
          );
        })}
      </div>

      {inquiries.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-line bg-white p-10 text-center">
          <p className="font-sign text-2xl font-semibold">No enquiries here</p>
          <p className="mt-2 text-muted">When a customer sends a message from a car page, it will show up here.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id} className="rounded-lg border border-line bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-sign text-2xl font-bold">
                    {inquiry.name}
                    <span className="ml-3 rounded bg-paper px-2 py-0.5 text-sm font-semibold text-muted">
                      {typeLabels[inquiry.type]}
                    </span>
                  </p>
                  <p className="text-sm text-muted">Sent {niceDate(inquiry.createdAt)}</p>
                </div>
                <span className={`rounded px-2 py-0.5 text-sm font-medium ${statusStyle[inquiry.status]}`}>
                  {statusLabels[inquiry.status]}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                <a href={`tel:${inquiry.phone}`} className="font-semibold hover:underline">
                  {formatPhone(inquiry.phone)}
                </a>
                <a
                  href={whatsappHref(inquiry.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:underline"
                >
                  WhatsApp
                </a>
                {inquiry.email && (
                  <a href={`mailto:${inquiry.email}`} className="font-semibold hover:underline">
                    {inquiry.email}
                  </a>
                )}
                {inquiry.preferredDate && (
                  <span className="text-muted">Test drive: {niceDate(inquiry.preferredDate, "UTC")}</span>
                )}
              </div>

              {inquiry.car && (
                <p className="mt-2 text-sm">
                  About{" "}
                  <Link href={`/cars/${inquiry.car.id}`} className="font-semibold hover:underline">
                    {inquiry.car.year} {inquiry.car.make} {inquiry.car.model}
                  </Link>
                </p>
              )}

              <p className="mt-3 whitespace-pre-line rounded-md bg-paper p-3">{inquiry.message}</p>

              <div className="mt-4 flex flex-wrap gap-3">
                {Object.values(InquiryStatus)
                  .filter((value) => value !== inquiry.status)
                  .map((value) => (
                    <form key={value} action={updateInquiryStatus.bind(null, inquiry.id, value)}>
                      <button
                        type="submit"
                        className="rounded-md border border-line px-3 py-1.5 text-sm font-semibold hover:border-road"
                      >
                        Mark {statusLabels[value].toLowerCase()}
                      </button>
                    </form>
                  ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
