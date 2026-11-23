"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { InquiryStatus } from "@/generated/prisma/enums";

const isStatus = (value: string): value is InquiryStatus =>
  Object.values(InquiryStatus).includes(value as InquiryStatus);

export async function updateInquiryStatus(id: string, status: string) {
  await requireAdmin();
  if (!isStatus(status)) throw new Error("Invalid enquiry status.");

  await prisma.inquiry.update({ where: { id }, data: { status } });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}
