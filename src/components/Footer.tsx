import Link from "next/link";
import Logo from "./Logo";
import { site, formatPhone } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-road text-white">
      {/* Road-marking stripe along the top edge */}
      <div
        aria-hidden="true"
        className="h-1.5 bg-[repeating-linear-gradient(90deg,var(--color-marking)_0_40px,transparent_40px_64px)]"
      />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo variant="full" />
        </div>

        <div>
          <h2 className="font-sign text-xl font-semibold">Visit or call</h2>
          <ul className="mt-3 space-y-1.5 text-white/85">
            <li>{site.address}</li>
            <li>{site.hours}</li>
            {site.phones.map((phone) => (
              <li key={phone}>
                <a href={`tel:${phone}`} className="underline-offset-4 hover:underline">
                  {formatPhone(phone)}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`https://wa.me/${site.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                Chat on WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="underline-offset-4 hover:underline">
                {site.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-sign text-xl font-semibold">Browse</h2>
          <ul className="mt-3 space-y-1.5 text-white/85">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="underline-offset-4 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            {site.socials.map((social) => (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:underline"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="border-t border-white/15 px-4 py-4 text-center text-sm text-white/70">
        © {year} {site.fullName}
      </p>
    </footer>
  );
}
