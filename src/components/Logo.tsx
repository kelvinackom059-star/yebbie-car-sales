import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

// Two versions of the logo, chosen with the `variant` prop:
//   <Logo />               → small shield + name, for the navbar
//   <Logo variant="full" /> → the complete badge, for the footer
type LogoProps = {
  variant?: "mark" | "full";
};

export default function Logo({ variant = "mark" }: LogoProps) {
  if (variant === "full") {
    return (
      <Link href="/" aria-label={`${site.fullName} home`} className="inline-block">
        <Image
          src="/brand/yebbie-logo.jpg"
          alt={site.fullName}
          width={160}
          height={158}
          className="rounded-lg"
        />
      </Link>
    );
  }

  return (
    <Link href="/" aria-label={`${site.fullName} home`} className="flex items-center gap-2.5">
      <Image
        src="/brand/yebbie-emblem.png"
        alt=""
        width={44}
        height={44}
        priority // load straight away — it's at the top of every page
      />
      <span className="flex flex-col leading-none">
        <span className="font-sign text-2xl font-bold tracking-[0.08em] text-gold">YEBBIE</span>
        <span className="font-sign text-xs font-semibold tracking-[0.2em] text-white/80">CAR SALES</span>
      </span>
    </Link>
  );
}
