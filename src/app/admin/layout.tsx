import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

// This layout wraps EVERY page inside /admin.
// Because requireAdmin() runs here, every admin page is protected
// automatically, including pages we add later.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <p className="font-sign text-xl font-semibold">
          Admin <span className="font-normal text-muted">· {admin.name}</span>
        </p>
        <nav aria-label="Admin" className="flex gap-6 font-sign text-lg font-semibold">
          <Link href="/admin" className="hover:text-marking-dark">
            Dashboard
          </Link>
          <Link href="/admin/cars" className="hover:text-marking-dark">
            Cars
          </Link>
          <Link href="/admin/inquiries" className="hover:text-marking-dark">
            Enquiries
          </Link>
          <Link href="/cars" className="hover:text-marking-dark">
            View site
          </Link>
        </nav>
      </div>
      <div className="pt-8">{children}</div>
    </div>
  );
}
