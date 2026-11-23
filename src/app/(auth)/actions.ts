"use server";
// "use server" = these functions run ONLY on the server.
// Forms call them directly — no API routes needed.

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

// What a form gets back when something is wrong
export type FormState = {
  error?: string;
  fields?: Record<string, string>; // so the form keeps what they typed
} | undefined;

// ─────────────────────────────── LOG IN (admin only)
// Customers don't have accounts any more: they browse and then call or WhatsApp.
// So only ADMIN users are allowed to log in.
export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fields = { email };

  if (!email || !password) return { error: "Enter your email and password.", fields };

  const user = await prisma.user.findUnique({ where: { email } });

  // Same message for a wrong email, a wrong password, or a non-admin account,
  // so attackers can't use this form to discover which emails exist.
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !valid || user.role !== "ADMIN") return { error: "Email or password is incorrect.", fields };

  await createSession({ userId: user.id, role: user.role });
  redirect("/admin");
}

// ─────────────────────────────── LOG OUT
export async function logout() {
  await deleteSession();
  redirect("/");
}
