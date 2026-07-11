import type { ReactNode } from "react";
import styles from "./ui.module.css";
export function FeedbackMessage({
  children,
  tone = "error",
  id,
}: {
  children: ReactNode;
  tone?: "error" | "success";
  id?: string;
}) {
  return (
    <p
      aria-live="polite"
      className={`${styles.feedback} ${styles[tone]}`}
      id={id}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
