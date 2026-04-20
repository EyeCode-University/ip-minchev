import { MAP_CITIES } from '@/lib/constants';
import styles from './CitiesMarquee.module.css';

export default function CitiesMarquee() {
  return (
    <section className={styles.section} aria-label="География поставок">
      <div className={styles.marquee}>
        <div className={styles.group}>
          {MAP_CITIES.map(({ name }) => (
            <span key={`a-${name}`} className={styles.city}>
              {name}
            </span>
          ))}
        </div>
        <div className={styles.group} aria-hidden="true">
          {MAP_CITIES.map(({ name }) => (
            <span key={`b-${name}`} className={styles.city}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
