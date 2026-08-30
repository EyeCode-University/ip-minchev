import Link from 'next/link';
import Image from 'next/image';
import { COMPANY, MACHINE_FLEET } from '@/lib/constants';
import styles from './LandingPage.module.css';

/*
  Общий шаблон посадочной страницы направления. Серверный компонент — весь
  текст обязан быть в исходном HTML, ради этого страницы и заводились.
  Содержимое приходит из src/lib/landings.js.
*/
export default function LandingPage({ data }) {
  return (
    <article className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumbs} aria-label="Хлебные крошки">
          <Link href="/" className={styles.crumbLink}>
            Главная
          </Link>
          <span className={styles.crumbSep} aria-hidden="true">
            /
          </span>
          <span aria-current="page">{data.navLabel}</span>
        </nav>

        <h1 className={styles.title}>{data.h1}</h1>

        {data.lead.map((paragraph, i) => (
          <p key={i} className={styles.lead}>
            {paragraph}
          </p>
        ))}

        <div className={styles.ctaRow}>
          <Link href="/#request" className={styles.ctaPrimary}>
            Оставить заявку
          </Link>
          <a href={COMPANY.phoneHref} className={styles.ctaPhone}>
            {COMPANY.phone}
          </a>
        </div>

        {data.specs && (
          <section className={styles.section}>
            <h2 className={styles.heading}>Параметры</h2>
            <dl className={styles.specs}>
              {data.specs.map((spec) => (
                <div key={spec.label} className={styles.specRow}>
                  <dt className={styles.specLabel}>{spec.label}</dt>
                  <dd className={styles.specValue}>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {data.capabilities.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.heading}>Технологические возможности</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Операция</th>
                    <th>Габариты обработки</th>
                  </tr>
                </thead>
                <tbody>
                  {data.capabilities.map((cap, i) => (
                    <tr key={`${cap.name}-${i}`}>
                      <td>{cap.name}</td>
                      <td className={styles.tdParams}>{cap.params}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {data.showFleet && (
          <section className={styles.section}>
            <h2 className={styles.heading}>Станочный парк</h2>
            <p className={styles.note}>
              {MACHINE_FLEET.length} единиц собственного оборудования
            </p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Тип станка</th>
                    <th>Модель</th>
                    <th>Рабочая зона</th>
                  </tr>
                </thead>
                <tbody>
                  {MACHINE_FLEET.map((machine, i) => {
                    // Дублирующийся тип не повторяем — так строки группируются
                    // визуально, как в таблице на главной.
                    const firstOfType =
                      i === 0 || MACHINE_FLEET[i - 1].type !== machine.type;
                    return (
                      <tr key={`${machine.model}-${i}`}>
                        <td>{firstOfType ? machine.type : ''}</td>
                        <td>{machine.model}</td>
                        <td className={styles.tdParams}>{machine.spec}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {data.images.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.heading}>Изготовленные изделия</h2>
            <div className={styles.grid}>
              {data.images.map((image) => (
                <figure key={image.src} className={styles.card}>
                  <span className={styles.thumb}>
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={400}
                      height={300}
                      className={styles.image}
                      sizes="(max-width: 480px) 100vw, (max-width: 734px) 50vw, 33vw"
                    />
                  </span>
                  <figcaption className={styles.caption}>
                    <span className={styles.captionTitle}>{image.title}</span>
                    {image.subtitle && (
                      <span className={styles.captionSubtitle}>{image.subtitle}</span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.heading}>Как заказать</h2>
          <p className={styles.lead}>
            Пришлите чертёж или фотографию изношенной детали — рассчитаем
            стоимость и сроки. Ответим в течение рабочего дня.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/#request" className={styles.ctaPrimary}>
              Оставить заявку
            </Link>
            <a href={COMPANY.emailHref} className={styles.ctaPhone}>
              {COMPANY.email}
            </a>
          </div>
        </section>

        {/* Перелинковка: каждое направление ссылается на соседние, иначе
            страницы висят изолированно и вес по ним не расходится. */}
        <section className={styles.section}>
          <h2 className={styles.heading}>Другие направления</h2>
          <ul className={styles.others}>
            {data.others.map((other) => (
              <li key={other.slug}>
                <Link href={`/${other.slug}`} className={styles.otherLink}>
                  {other.navLabel}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}
