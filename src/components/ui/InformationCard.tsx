import type { ReactNode } from "react";
import styles from "./ui.module.css";
export function InformationCard({
  children,
  className = "",
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: "default" | "minimal";
}) {
  return (
    <article
      className={`${styles.card} ${variant === "minimal" ? styles.cardMinimal : ""} ${className}`}
    >
      {children}
    </article>
  );
}
