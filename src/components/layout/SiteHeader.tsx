"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/config/site";
import styles from "./header.module.css";

const links = [
  ["Home", "/"],
  ["Our Story", "/#story"],
  ["Photos", "/#photos"],
  ["Q+A", "/#faq"],
  ["Travel", "/#travel"],
  ["RSVP", "/invite"],
  ["Gifts", "/#gifts"],
] as const;

export function MobileNavigation({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const drawer = closeRef.current?.closest("aside");
        const focusable = drawer?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", keyboard);
      previous?.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className={styles.overlay} role="presentation">
      <aside
        aria-label="Mobile navigation"
        aria-modal="true"
        className={styles.drawer}
        role="dialog"
      >
        <div className={styles.drawerTop}>
          <span className={styles.monogram}>{siteConfig.monogram}</span>
          <button
            aria-label="Close menu"
            className={styles.closeButton}
            onClick={onClose}
            ref={closeRef}
          >
            Close
          </button>
        </div>
        <nav className={styles.mobileLinks}>
          {links.map(([label, href]) => (
            <Link href={href} key={label} onClick={onClose}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header className={`container ${styles.header}`}>
        <Link
          aria-label="Hannah and Isaac home"
          className={styles.monogram}
          href="/"
        >
          {siteConfig.monogram}
        </Link>
        <nav aria-label="Primary navigation" className={styles.desktopNav}>
          {links.map(([label, href]) => (
            <Link href={href} key={label}>
              {label}
            </Link>
          ))}
        </nav>
        <button
          aria-expanded={open}
          aria-label="Open menu"
          className={styles.menuButton}
          onClick={() => setOpen(true)}
        >
          <span aria-hidden="true" className={styles.menuIcon}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </header>
      <MobileNavigation onClose={() => setOpen(false)} open={open} />
    </>
  );
}
