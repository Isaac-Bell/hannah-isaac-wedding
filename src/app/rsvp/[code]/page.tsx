import { SiteHeader } from "@/components/layout/SiteHeader";
import { RSVPPreview } from "@/components/rsvp/RSVPPreview";
import styles from "@/components/rsvp/rsvp.module.css";
export default function RsvpPage() {
  return (
    <main className={styles.main}>
      <SiteHeader />
      <section className={`container ${styles.content}`}>
        <h1 className={styles.title}>Your household RSVP</h1>
        <RSVPPreview />
      </section>
    </main>
  );
}
