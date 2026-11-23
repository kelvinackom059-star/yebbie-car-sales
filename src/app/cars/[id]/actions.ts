"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { InquiryType } from "@/generated/prisma/enums";

export type EnquiryFormState =
  | {
      errors?: Record<string, string>;
      values?: Record<string, string>;
      success?: boolean;
    }
  | undefined;

const isInquiryType = (value: string): value is InquiryType =>
  Object.values(InquiryType).includes(value as InquiryType);

// Visitors can send a purchase enquiry, ask for a test drive, or just ask a
// question without creating an account. The car id is bound in by the page.
export async function createInquiry(
  carId: string,
  _prev: EnquiryFormState,
  formData: FormData,
): Promise<EnquiryFormState> {
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    type: String(formData.get("type") ?? "PURCHASE"),
    preferredDate: String(formData.get("preferredDate") ?? ""),
    message: String(formData.get("message") ?? "").trim(),
  };

  // Honeypot: real people never fill this hidden field, bots often do.
  if (String(formData.get("website") ?? "")) return { success: true };

  const errors: Record<string, string> = {};

  if (!values.name) errors.name = "Enter your name.";

  const digits = values.phone.replace(/\D/g, "");
  if (!values.phone) errors.phone = "Enter your phone number.";
  else if (digits.length < 7 || digits.length > 15) errors.phone = "Enter a valid phone number.";

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!isInquiryType(values.type)) errors.type = "Choose what you need.";
  if (values.message.length < 5) errors.message = "Tell us a little about what you need.";

  let preferredDate: Date | null = null;
  if (values.type === "TEST_DRIVE" && values.preferredDate) {
    const parsed = new Date(`${values.preferredDate}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) errors.preferredDate = "Choose a valid date.";
    else preferredDate = parsed;
  }

  if (Object.keys(errors).length > 0) return { errors, values };

  // Never trust the car id from the browser: make sure it really exists.
  const car = await prisma.car.findUnique({ where: { id: carId }, select: { id: true } });
  if (!car) return { errors: { message: "This car is no longer available." }, values };

  const user = await getCurrentUser();

  await prisma.inquiry.create({
    data: {
      carId: car.id,
      userId: user?.id ?? null,
      name: values.name,
      phone: values.phone,
      email: values.email || null,
      type: values.type as InquiryType,
      message: values.message,
      preferredDate,
    },
  });

  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");

  return { success: true };
}
