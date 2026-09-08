'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { submitApplication } from '@/app/actions';
import FadeIn from '@/components/FadeIn';
import SuccessModal from './SuccessModal';
import styles from './RequestForm.module.css';

const initialState = { success: false, error: null };

function SubmitButton({ disabled }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.submit} disabled={pending || disabled}>
      <span>{pending ? 'Отправка…' : 'Отправить заявку'}</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </button>
  );
}

export default function RequestForm() {
  const [state, formAction] = useActionState(submitApplication, initialState);
  const [fileName, setFileName] = useState('');
  const [consent, setConsent] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [docDate, setDocDate] = useState('');
  const formRef = useRef(null);

  // Видимость модалки отделена от state.success (useActionState нельзя сбросить
  // извне), поэтому поднимаем флаг в эффекте — намеренный паттерн.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (state.success) setShowSuccess(true);
  }, [state.success]);

  // Дату ставим после монтирования — иначе SSR/CSR могут разойтись (гидрация).
  useEffect(() => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDocDate(`${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : '');
  };

  const handleCloseModal = () => {
    formRef.current?.reset();
    setFileName('');
    setConsent(false);
    setShowSuccess(false);
  };

  return (
    <section id="request" className={styles.section}>
      <div className="container">
        <FadeIn delay={0.1}>
          <div className={styles.sheet}>
            <span className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
            <span className={styles.fold} aria-hidden="true" />
            <span className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
            <span className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />

            {/* Тех-шапка */}
            <div className={styles.meta}>
              <span className={styles.metaTag}>
                <span className={styles.metaDot} aria-hidden="true" />
                Бланк заявки&nbsp;&nbsp;·&nbsp;&nbsp;Форма № 01
              </span>
              <span className={styles.metaDate}>Дата: {docDate || '—'}</span>
            </div>
            <div className={styles.rule} />

            {/* Заголовок */}
            <div className={styles.head}>
              <div className={styles.headText}>
                <p className={styles.kicker}>Раздел · Заявка</p>
                <h2 className={styles.title}>
                  Создать<br />заявку
                </h2>
                <p className={styles.subtitle}>
                  Прикрепите чертёж или техническое задание — рассчитаем стоимость
                  в течение 24 часов.
                </p>
              </div>

              <Image
                className={styles.scope}
                src="/assets/drawing/scheme.png"
                alt=""
                aria-hidden="true"
                width={1536}
                height={1024}
              />
            </div>
            <div className={styles.rule} />

            {/* Форма */}
            <form ref={formRef} action={formAction} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="name" className={styles.label}>
                    <span className={styles.idx}>01</span> Имя / Компания
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Ваше имя или название компании"
                    className={styles.input}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="contact" className={styles.label}>
                    <span className={styles.idx}>02</span> Телефон или Email
                  </label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    required
                    placeholder="+7 ... или email@example.com"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="message" className={styles.label}>
                  <span className={styles.idx}>03</span> Описание запроса
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Опишите необходимую деталь, параметры, количество..."
                  className={styles.textarea}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <span className={styles.idx}>04</span> Прикрепить файл
                </label>
                {/* Скрытый input идёт перед подписью намеренно: кольцо фокуса
                    рисуется на .fileLabel соседним селектором (+), а он
                    работает только для последующего элемента. */}
                <input
                  type="file"
                  id="file"
                  name="file"
                  required
                  accept=".jpg,.jpeg,.png,.pdf,.dwg"
                  className={styles.fileInput}
                  onChange={handleFileChange}
                />
                <label className={styles.fileLabel} htmlFor="file">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                  </svg>
                  {fileName || 'Приложить файл · jpg · png · pdf · dwg'}
                </label>
              </div>

              <div className={styles.consent}>
                <label className={styles.consentLabel}>
                  <input
                    type="checkbox"
                    name="consent"
                    value="on"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className={styles.consentCheckbox}
                  />
                  <span className={styles.consentText}>
                    Я даю согласие на обработку персональных данных в соответствии с{' '}
                    <Link href="/privacy" target="_blank" rel="noopener noreferrer" className={styles.consentLink}>
                      Политикой конфиденциальности
                    </Link>{' '}
                    и{' '}
                    <Link href="/consent" target="_blank" rel="noopener noreferrer" className={styles.consentLink}>
                      Согласием на обработку ПДн
                    </Link>.
                  </span>
                </label>
              </div>

              {state.error && (
                <div className={styles.error} role="alert">
                  Ошибка: {state.error}
                </div>
              )}

              <SubmitButton disabled={!consent} />
            </form>
          </div>
        </FadeIn>
      </div>

      {showSuccess && <SuccessModal onClose={handleCloseModal} />}
    </section>
  );
}
