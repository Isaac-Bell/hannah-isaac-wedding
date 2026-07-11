import type { ReactNode } from "react";
import styles from "./ui.module.css";
export function InformationCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={`${styles.card} ${className}`}>{children}</article>
  );
}
