import type { Metadata } from "next";
import { site, formatPhone } from "@/lib/site";

export const metadata: Metadata = { title: "Contact us" };

// A simple page: no database, everything comes from src/lib/site.ts.
// Change a phone number there and it updates here (and in the footer) too.
export default function ContactPage() {
  const whatsappUrl = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hello Yebbie, I'd like to ask about a car.")}`;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-sign text-5xl font-bold text-ink">Contact us</h1>
      <p className="mt-3 max-w-xl text-lg text-muted">
        Seen a car you like, or looking for something specific? Message or call us. {site.hours}.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {/* WhatsApp: the main way customers reach Yebbie */}
        <div className="flex flex-col rounded-lg border border-line bg-white p-6">
          <h2 className="font-sign text-3xl font-bold">WhatsApp</h2>
          <p className="mt-2 text-muted">The quickest way to reach us. Send photos or questions any time.</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 self-start rounded-md bg-marking px-6 py-3 font-sign text-xl font-semibold text-road hover:bg-marking-dark"
          >
            Chat on WhatsApp
          </a>
        </div>

        {/* Phone numbers: tel: links open the dialler on phones */}
        <div className="rounded-lg border border-line bg-white p-6">
          <h2 className="font-sign text-3xl font-bold">Call us</h2>
          <ul className="mt-4 space-y-3">
            {site.phones.map((phone) => (
              <li key={phone}>
                <a href={`tel:${phone}`} className="font-sign text-2xl font-semibold tabular-nums hover:text-marking-dark">
                  {formatPhone(phone)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <dl className="mt-10 grid gap-x-6 sm:grid-cols-3">
        <div className="border-t border-line py-4">
          <dt className="text-sm text-muted">Visit</dt>
          <dd className="font-semibold">{site.address}</dd>
        </div>
        <div className="border-t border-line py-4">
          <dt className="text-sm text-muted">Email</dt>
          <dd className="font-semibold break-words">
            <a href={`mailto:${site.email}`} className="hover:underline">
              {site.email}
            </a>
          </dd>
        </div>
        <div className="border-t border-line py-4">
          <dt className="text-sm text-muted">Follow us</dt>
          <dd className="flex gap-4 font-semibold">
            {site.socials.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {s.label}
              </a>
            ))}
          </dd>
        </div>
      </dl>
    </section>
  );
}
