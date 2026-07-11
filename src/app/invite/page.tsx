import Link from "next/link";
import { InvitationCodeInput } from "@/components/invitation/InvitationCodeInput";
import { siteConfig } from "@/lib/config/site";
import styles from "@/components/invitation/invitation.module.css";
export default function InvitePage() {
  return (
    <main className={styles.shell}>
      <header className={`container ${styles.top}`}>
        <Link aria-label="Back to homepage" className={styles.back} href="/">
          ←
        </Link>
        <Link className={styles.monogram} href="/">
          {siteConfig.monogram}
        </Link>
        <span />
      </header>
      <section className={`container ${styles.panel}`}>
        <h1 className={styles.title}>RSVP</h1>
        <p className={styles.intro}>
          Welcome. Enter the unique invitation code printed on your physical
          invitation to begin.
        </p>
        <InvitationCodeInput />
        <Link className={styles.home} href="/">
          Back to homepage
        </Link>
      </section>
    </main>
  );
}
