import Link from "next/link";
import { InvitationForm } from "@/components/invitation/InvitationForm";
import styles from "@/components/invitation/invitation.module.css";
import { siteConfig } from "@/lib/config/site";

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
        <p className={styles.eyebrow}>Private guest portal</p>
        <h1 className={styles.title}>RSVP</h1>
        <p className={styles.intro}>
          Welcome. Enter the unique invitation code printed on your physical
          invitation to view your private guest details.
        </p>
        <InvitationForm />
        <Link className={styles.home} href="/">
          Back to homepage
        </Link>
      </section>
    </main>
  );
}
