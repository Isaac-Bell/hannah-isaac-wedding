import { siteConfig } from "@/lib/config/site";
import styles from "../guest.module.css";

export default function DetailsPage() {
  return (
    <main className={`container ${styles.page}`}>
      <p className="eyebrow">Private details</p>
      <h1>The celebration</h1>
      <p className={styles.lede}>
        {siteConfig.weddingDateDisplay} · {siteConfig.weddingLocation}
      </p>
      <p className={styles.quiet}>
        {siteConfig.dateStatus} · {siteConfig.locationStatus}
      </p>
      <section>
        <h2>Venue and schedule</h2>
        <p>
          Private venue, arrival, and schedule information will appear here once
          confirmed.
        </p>
      </section>
    </main>
  );
}
