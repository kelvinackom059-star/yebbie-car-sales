"use client";
// "use client" = this component runs in the browser,
// because it needs useState to open/close the mobile menu.

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { site } from "@/lib/site";
import { logout } from "@/app/(auth)/actions";

// The layout (a server component) checks whether the ADMIN is logged in.
// Customers never log in, so visitors just see the normal links.
type NavbarProps = { isAdmin: boolean };

const linkClass = "font-sign text-lg font-semibold text-white hover:text-marking";
const buttonClass =
  "rounded-md bg-marking px-4 py-2 font-sign text-lg font-semibold text-road hover:bg-marking-dark";

export default function Navbar({ isAdmin }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-road text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo />

        {/* Desktop links — hidden on small screens (md: = 768px and up) */}
        <ul className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={linkClass}>
                {item.label}
              </Link>
            </li>
          ))}
          {isAdmin && (
            <>
              <li>
                <Link href="/admin" className={linkClass}>
                  Admin
                </Link>
              </li>
              <li>
                {/* A form that calls the logout server action */}
                <form action={logout}>
                  <button type="submit" className={buttonClass}>
                    Log out
                  </button>
                </form>
              </li>
            </>
          )}
        </ul>

        {/* Mobile menu button — only on small screens */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="rounded-md border border-white/30 px-3 py-1.5 font-sign text-lg font-semibold md:hidden"
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {/* Mobile menu — shown only when open */}
      {open && (
        <ul id="mobile-menu" className="border-t border-white/15 px-4 pb-4 md:hidden">
          {[...site.nav, ...(isAdmin ? [{ label: "Admin", href: "/admin" }] : [])].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block border-b border-white/15 py-3 font-sign text-xl font-semibold hover:text-marking"
              >
                {item.label}
              </Link>
            </li>
          ))}
          {isAdmin && (
            <li>
              <form action={logout}>
                <button type="submit" className="w-full py-3 text-left font-sign text-xl font-semibold hover:text-marking">
                  Log out
                </button>
              </form>
            </li>
          )}
        </ul>
      )}
    </header>
  );
}
