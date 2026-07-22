import Link from "next/link";
import { forgetDeviceAction } from "@/app/(guest)/actions";
import { siteConfig } from "@/lib/config/site";
import styles from "./guest-navigation.module.css";

const links = [
  ["Details", "/details"],
  ["RSVP", "/rsvp"],
  ["Travel", "/travel"],
  ["Gifts", "/gifts"],
] as const;

export function GuestNavigation({ partyName }: { partyName: string }) {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link className={styles.monogram} href="/details">
          {siteConfig.monogram}
        </Link>
        <div className={styles.party}>{partyName}</div>
        <nav
          aria-label="Guest portal"
          className={`${styles.nav} ${styles.desktop}`}
        >
          {links.map(([label, href]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
        <details className={styles.mobile}>
          <summary>Menu</summary>
          <nav aria-label="Mobile guest portal" className={styles.nav}>
            {links.map(([label, href]) => (
              <Link href={href} key={href}>
                {label}
              </Link>
            ))}
          </nav>
        </details>
        <form action={forgetDeviceAction}>
          <button className={styles.forget} type="submit">
            Forget this device
          </button>
        </form>
      </div>
    </header>
  );
}
