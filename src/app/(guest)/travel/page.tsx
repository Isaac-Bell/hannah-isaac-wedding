import { getTravelEnvironment } from "@/lib/config/env";
import { travelContent } from "@/content/travel";
import styles from "../guest.module.css";

export default function TravelPage() {
  const environment = getTravelEnvironment();
  return (
    <main className={`container ${styles.page}`}>
      <p className="eyebrow">Guest guide</p>
      <h1>Travel</h1>
      <p className={styles.lede}>
        General planning guidance for your trip to Kansas City.
      </p>
      <p className={styles.quiet}>Last reviewed {travelContent.lastReviewed}</p>
      <section>
        <h2>Getting here</h2>
        <div className={styles.card}>
          <h3>
            {travelContent.arrival.airport} ({travelContent.arrival.airportCode}
            )
          </h3>
          <p>{travelContent.arrival.guidance}</p>
          {environment.TRAVEL_AIRPORT_INFO_URL ? (
            <a
              className={styles.link}
              href={environment.TRAVEL_AIRPORT_INFO_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              Airport information
            </a>
          ) : (
            <p className={styles.quiet}>
              Airport information link coming soon.
            </p>
          )}
          <h3>Driving</h3>
          <p>{travelContent.arrival.driving}</p>
        </div>
      </section>
      <section>
        <h2>Where to stay</h2>
        {travelContent.accommodations.length ? (
          <div className={styles.grid}>
            {travelContent.accommodations.map((item) => (
              <article className={styles.card} key={item.name}>
                <p className="eyebrow">{item.area}</p>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                {item.travelTimeNote && <p>{item.travelTimeNote}</p>}
                <a
                  href={item.bookingUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Booking information
                </a>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.card}>
            <h3>Recommendations coming soon</h3>
            <p>
              Accommodation suggestions will be added after Hannah and Isaac
              approve them. No hotel block or discount is currently promised.
            </p>
          </div>
        )}
      </section>
      <section>
        <h2>Getting around</h2>
        <div className={styles.grid}>
          {travelContent.gettingAround.map(([title, text]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2>International guests</h2>
        <ul className={styles.list}>
          {travelContent.international.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Things to do</h2>
        <div className={styles.grid}>
          {travelContent.activities.map((item) => (
            <article className={styles.card} key={item.category}>
              <p className="eyebrow">{item.category}</p>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a
                href={item.sourceUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Official visitor information
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
