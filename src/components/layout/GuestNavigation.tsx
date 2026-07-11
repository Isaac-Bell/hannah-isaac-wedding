import Link from "next/link";
import { forgetDeviceAction } from "@/app/(guest)/actions";
import { siteConfig } from "@/lib/config/site";

const links = [
  ["Details", "/details"],
  ["RSVP", "/rsvp"],
  ["Travel", "/travel"],
  ["Gifts", "/gifts"],
] as const;

export function GuestNavigation({ partyName }: { partyName: string }) {
  return (
    <header className="guest-header">
      <div className="container guest-header-inner">
        <Link className="guest-monogram" href="/details">
          {siteConfig.monogram}
        </Link>
        <div className="guest-party">{partyName}</div>
        <nav aria-label="Guest portal">
          {links.map(([label, href]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
        <details className="guest-mobile-menu">
          <summary>Menu</summary>
          <nav aria-label="Mobile guest portal">
            {links.map(([label, href]) => (
              <Link href={href} key={href}>
                {label}
              </Link>
            ))}
          </nav>
        </details>
        <form action={forgetDeviceAction}>
          <button className="text-button" type="submit">
            Forget this device
          </button>
        </form>
      </div>
    </header>
  );
}
