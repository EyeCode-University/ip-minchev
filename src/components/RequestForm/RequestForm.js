'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
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
      {pending ? 'Отправка...' : 'Отправить заявку'}
    </button>
  );
}

export default function RequestForm() {
  const [state, formAction] = useActionState(submitApplication, initialState);
  const [fileName, setFileName] = useState('');
  const [consent, setConsent] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    if (state.success) setShowSuccess(true);
  }, [state.success]);

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
        <FadeIn>
          <p className={styles.eyebrow}>Заявка</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className={styles.heading}>Создать заявку</h2>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className={styles.subheading}>
            Прикрепите чертёж или техническое задание —
            мы рассчитаем стоимость в течение 24 часов
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <form ref={formRef} action={formAction} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="name" className={styles.label}>
                  Имя / Компания
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
                  Телефон или Email
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
                Описание запроса
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
              <label className={styles.label}>Прикрепить файл</label>
              <label className={styles.fileLabel} htmlFor="file">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
                {fileName || 'Выберите файл (jpg, png, pdf, dwg)'}
              </label>
              <input
                type="file"
                id="file"
                name="file"
                required
                accept=".jpg,.jpeg,.png,.pdf,.dwg"
                className={styles.fileInput}
                onChange={handleFileChange}
              />
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
                {state.error}
              </div>
            )}

            <SubmitButton disabled={!consent} />
          </form>
        </FadeIn>
      </div>

      {showSuccess && <SuccessModal onClose={handleCloseModal} />}
    </section>
  );
}
