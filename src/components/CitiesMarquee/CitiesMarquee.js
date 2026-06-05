import { MAP_CITIES } from '@/lib/constants';
import styles from './CitiesMarquee.module.css';

function Pin() {
  return (
    <svg
      className={styles.pin}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function Row({ cities, reverse }) {
  return (
    <div className={styles.row}>
      <div className={`${styles.track} ${reverse ? styles.reverse : ''}`}>
        {[0, 1].map((g) => (
          <div className={styles.group} key={g} aria-hidden={g === 1 ? 'true' : undefined}>
            {cities.map(({ name }) => (
              <span key={`${g}-${name}`} className={styles.city}>
                <Pin />
                {name}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CitiesMarquee() {
  return (
    <section className={styles.section} aria-label="География поставок">
      <div className={styles.rows}>
        <Row cities={MAP_CITIES} />
      </div>
    </section>
  );
}
