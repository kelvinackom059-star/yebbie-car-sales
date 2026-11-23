// All of Yebbie's business details live here.
// Change them once, and every page that uses them updates.
// Source: Yebbie's flyer. Items marked TODO still need confirming with the owner.

export const site = {
  name: "Yebbie",
  fullName: "Yebbie Car Sales",
  tagline: "Your safety, our priority",

  phones: ["0542517572", "0532551808"],
  whatsapp: "233542517572", // TODO: confirm which number is on WhatsApp (digits only, 233 instead of 0)
  email: "yebbiecarrentalsno.1@gmail.com",
  address: "Location to be confirmed", // TODO
  hours: "Support available 24/7",

  socials: [
    { label: "Instagram", href: "https://www.instagram.com/yebbie_car_rentals_no.1" },
    // TODO: add TikTok once we have the exact @handle
  ],

  nav: [
    { label: "Cars for sale", href: "/cars" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

// Turns "0542517572" into "054 251 7572" for display
export function formatPhone(phone: string) {
  return phone.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");
}
