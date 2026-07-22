import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/Button";
import { InformationCard } from "@/components/ui/InformationCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Countdown } from "@/components/wedding/Countdown";
import { BotanicalOrnament } from "@/components/wedding/BotanicalOrnament";
import { siteConfig } from "@/lib/config/site";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <section className={`container ${styles.hero}`}>
          <BotanicalOrnament side="left" />
          <BotanicalOrnament side="right" />
          <div className={styles.heroContent}>
            <p className={styles.scriptEyebrow}>The wedding of</p>
            <h1 className={styles.title}>{siteConfig.coupleNames}</h1>
            <p className={styles.dateLocationLine}>
              {siteConfig.weddingDateUppercase}
              <span aria-hidden="true"> • </span>
              {siteConfig.weddingLocation.toUpperCase()}
            </p>
            <Countdown target={siteConfig.weddingDateIso} variant="summary" />
            <p className={styles.configurationStatus}>
              {siteConfig.dateStatus} · {siteConfig.locationStatus}
            </p>
          </div>
          <div
            aria-label="Wedding photograph placeholder"
            className={styles.imageFrame}
            role="img"
          >
            <div className={styles.imagePlaceholder}>Photograph to come</div>
          </div>
        </section>
        <section className={styles.welcome}>
          <div className="container">
            <p>
              We can’t wait to celebrate our next chapter with the people who
              mean the most to us.
            </p>
          </div>
        </section>
        <section
          aria-label="Provisional wedding date and location"
          className={`container ${styles.stationeryDetails}`}
        >
          <div className={styles.stationeryItem}>
            <span className={styles.detailLabel}>Save the date</span>
            <p>{siteConfig.weddingDateDisplay}</p>
            <span className={styles.detailStatus}>{siteConfig.dateStatus}</span>
          </div>
          <div aria-hidden="true" className={styles.detailDivider} />
          <div className={styles.stationeryItem}>
            <span className={styles.detailLabel}>Celebrating in</span>
            <p>
              {siteConfig.weddingLocationCity},{" "}
              {siteConfig.weddingLocationRegion}
            </p>
            <span className={styles.detailStatus}>
              {siteConfig.locationStatus}
            </span>
          </div>
        </section>
        <section
          className={`container ${styles.split} ${styles.anchor}`}
          id="story"
        >
          <div
            aria-label="Couple photograph placeholder"
            className={styles.storyImage}
            role="img"
          />
          <div>
            <SectionHeading eyebrow="Our journey" title="The Story of Us" />
            <p className={styles.body}>
              We’ll share more of our story here soon. For now, we’re simply
              grateful for the memories behind us and the celebration ahead.
            </p>
            <Button href="#story" variant="secondary">
              Story coming soon
            </Button>
          </div>
        </section>
        <section className={styles.weekend}>
          <div className="container">
            <SectionHeading
              centered
              eyebrow="The celebration"
              title="The Weekend"
            />
            <div className={styles.cards}>
              {["The Welcome", "The Ceremony", "The Farewell"].map(
                (title, index) => (
                  <InformationCard
                    className={styles.scheduleItem}
                    key={title}
                    variant="minimal"
                  >
                    <span className="eyebrow">Event 0{index + 1}</span>
                    <h3 className={styles.cardTitle}>{title}</h3>
                    <p className={styles.body}>
                      Timing and location details are being finalized and will
                      be shared privately with invited guests.
                    </p>
                    <span className={styles.cardMeta}>
                      Details to be confirmed
                    </span>
                  </InformationCard>
                ),
              )}
            </div>
          </div>
        </section>
        <section className={`container ${styles.ctaWrap}`}>
          <div className={styles.cta}>
            <span className="eyebrow">Invitation only</span>
            <h2>Kindly RSVP</h2>
            <p>
              Use the unique code printed on your invitation to access your
              household response.
            </p>
            <Button href="/invite" variant="secondary">
              Enter invitation code
            </Button>
          </div>
        </section>
        <section className={`container ${styles.previews}`}>
          <InformationCard
            className={`${styles.preview} ${styles.anchor}`}
            variant="minimal"
          >
            <h2 id="travel">Travel</h2>
            <p className={styles.body}>
              Travel and accommodation guidance will be shared when arrangements
              are confirmed.
            </p>
            <Button href="/travel" variant="secondary">
              View guest travel guide
            </Button>
          </InformationCard>
          <InformationCard
            className={`${styles.preview} ${styles.anchor}`}
            variant="minimal"
          >
            <h2 id="gifts">Gifts</h2>
            <p className={styles.body}>
              Your presence is the greatest gift. Optional gifting information
              will be available privately later.
            </p>
            <Button href="/gifts" variant="secondary">
              View gift information
            </Button>
          </InformationCard>
        </section>
        <span className={styles.anchor} id="photos" />
        <span className={styles.anchor} id="faq" />
      </main>
      <SiteFooter />
    </>
  );
}
