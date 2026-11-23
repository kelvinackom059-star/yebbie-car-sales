import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { readSession } from "./session";

// Returns the logged-in user, or null if nobody is logged in.
// cache() means: even if 5 components ask during one page load,
// we only hit the database once.
export const getCurrentUser = cache(async () => {
  const session = await readSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    // Never select passwordHash here — it should never leave the server code that needs it.
    select: { id: true, name: true, email: true, phone: true, role: true },
  });
});

// Use at the top of every admin page.
// We check the role in the DATABASE, not just the cookie, so if an admin
// is ever demoted, they lose access straight away.
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
