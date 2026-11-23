import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin log in",
  robots: { index: false }, // keep this page out of Google
};

export default async function LoginPage() {
  // Already logged in as admin? Skip the form.
  const user = await getCurrentUser();
  if (user?.role === "ADMIN") redirect("/admin");

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-sign text-5xl font-bold">Admin log in</h1>
      <p className="mt-2 text-muted">For Yebbie staff only.</p>
      <div className="mt-8 rounded-lg border border-line bg-white p-6">
        <LoginForm />
      </div>
    </section>
  );
}
