import styles from "./ui.module.css";
export function SectionHeading({
  eyebrow,
  title,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  centered?: boolean;
}) {
  return (
    <header
      className={`${styles.sectionHeading} ${centered ? styles.center : ""}`}
    >
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 className={styles.heading}>{title}</h2>
    </header>
  );
}
