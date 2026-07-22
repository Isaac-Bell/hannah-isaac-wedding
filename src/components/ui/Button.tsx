import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./ui.module.css";

type Props = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;
export function Button({
  children,
  href,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: Props) {
  const classes = `${styles.button} ${styles[variant]} ${fullWidth ? styles.full : ""} ${className}`;
  if (href)
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
