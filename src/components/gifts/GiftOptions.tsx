import { CopyValueButton } from "./CopyValueButton";
import styles from "./gifts.module.css";

export type GiftConfiguration = {
  GIFT_ZELLE_RECIPIENT_NAME?: string;
  GIFT_ZELLE_EMAIL?: string;
  GIFT_ZELLE_PHONE?: string;
  GIFT_PAYPAL_ME_URL?: string;
};

export function GiftOptions({
  configuration,
}: {
  configuration: GiftConfiguration;
}) {
  const hasZelle = Boolean(
    configuration.GIFT_ZELLE_RECIPIENT_NAME ||
    configuration.GIFT_ZELLE_EMAIL ||
    configuration.GIFT_ZELLE_PHONE,
  );
  const copyValue =
    configuration.GIFT_ZELLE_EMAIL ?? configuration.GIFT_ZELLE_PHONE;
  if (!hasZelle && !configuration.GIFT_PAYPAL_ME_URL)
    return (
      <div className={styles.card}>
        <h2>Details coming soon</h2>
        <p>Optional gift information has not been configured.</p>
      </div>
    );
  return (
    <div className={styles.grid}>
      {hasZelle && (
        <section className={styles.card}>
          <p className="eyebrow">External personal payment</p>
          <h2>Zelle</h2>
          {configuration.GIFT_ZELLE_RECIPIENT_NAME && (
            <p>
              <strong>Recipient:</strong>{" "}
              {configuration.GIFT_ZELLE_RECIPIENT_NAME}
            </p>
          )}
          {configuration.GIFT_ZELLE_EMAIL && (
            <p>
              <strong>Email:</strong> {configuration.GIFT_ZELLE_EMAIL}
            </p>
          )}
          {configuration.GIFT_ZELLE_PHONE && (
            <p>
              <strong>Phone:</strong> {configuration.GIFT_ZELLE_PHONE}
            </p>
          )}
          {copyValue && <CopyValueButton value={copyValue} />}
          <p className={styles.quiet}>
            Confirm the recipient name in Zelle before sending. Amounts are
            entered and processed outside this website.
          </p>
        </section>
      )}
      {configuration.GIFT_PAYPAL_ME_URL && (
        <section className={styles.card}>
          <p className="eyebrow">External personal payment</p>
          <h2>PayPal.Me</h2>
          <p>
            Continue to PayPal.Me to make an optional gift. This website does
            not collect an amount or record payment completion.
          </p>
          <a
            className={styles.link}
            href={configuration.GIFT_PAYPAL_ME_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open PayPal.Me
          </a>
        </section>
      )}
    </div>
  );
}
