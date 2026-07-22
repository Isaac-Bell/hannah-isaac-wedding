import { siteConfig } from "@/lib/config/site";
import styles from "./footer.module.css";
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <p className={styles.monogram}>{siteConfig.monogram}</p>
        <p className={styles.meta}>
          {siteConfig.weddingDateShort}
          <span className={styles.status}>{siteConfig.dateStatus}</span>
        </p>
      </div>
    </footer>
  );
}
