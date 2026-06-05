# Fixed Issues

Журнал исправленных багов в проекте.

## 2026-05-29

### Заявки с файлом не приходили на email (файлы не доставлялись)

**Симптом.** На указанный в `EMAIL_TO` адрес не приходили письма с прикреплёнными файлами. Заявка с сайта будто бы отправлялась, но письмо с вложением не доходило.

**Диагностика.** Проверил всю цепочку отправки:

- SMTP-соединение (`smtp.yandex.ru:465`, SSL) — `transporter.verify()` → **OK**.
- Прямая отправка письма с вложением-`Buffer` теми же кредами из [.env.local](.env.local) — письмо принято Яндексом (`250 ... queued`, `accepted: [minchevaerika@yandex.ru]`, `rejected: []`).

То есть Nodemailer, креды и механизм вложений в [src/lib/sendEmail.js](src/lib/sendEmail.js) исправны. Значит, до самого `sendEmail` дело не доходило.

**Причина.** Дефолтный лимит размера тела Server Action в Next.js — **1 МБ** (см. `node_modules/next/dist/docs/.../serverActions.md`). При этом валидация в [src/app/actions.js](src/app/actions.js) разрешает файлы **до 10 МБ** (`MAX_FILE_SIZE = 10 * 1024 * 1024`). Любая заявка, где файл (плюс multipart-overhead) превышал ~1 МБ, отклонялась фреймворком **до запуска** `submitApplication` — то есть `sendEmail`/`sendTelegram` вообще не вызывались, а `try/catch` внутри action этот сбой не ловил (ошибка происходит на уровне парсинга тела запроса, вне action). Мелкие заявки (< 1 МБ) проходили, большинство реальных файлов (фото/чертежи) — нет.

**Фикс.** Поднял лимит тела Server Action в [next.config.mjs](next.config.mjs) до запаса над 10 МБ:

```js
experimental: {
  serverActions: {
    bodySizeLimit: '12mb',
  },
},
```

`'12mb'` (а не ровно `'10mb'`) — чтобы покрыть overhead multipart/кодирования при загрузке файла на максимальном размере. Теперь файл размером до 10 МБ доходит до `submitApplication`, и письмо с вложением уходит на email.

## 2026-04-17

### SuccessModal: модалка не закрывалась после отправки заявки

**Симптом.** После успешной отправки формы заявки показывалась модалка «Заявка отправлена», но кнопка «Закрыть» (как и клик по фону / Escape) не срабатывала — модалка висела на экране.

**Причина.** В [src/components/RequestForm/RequestForm.js](src/components/RequestForm/RequestForm.js) видимость `SuccessModal` была напрямую завязана на `state.success` из `useActionState`: `{state.success && <SuccessModal ... />}`. `useActionState` не позволяет менять состояние извне — оно обновляется только при следующем вызове server action. Обработчик `handleCloseModal` сбрасывал форму, но не мог обнулить `state.success`, поэтому модалка оставалась открытой навсегда.

**Фикс.** Отделил видимость модалки от результата action в локальный `useState`:

```js
const [showSuccess, setShowSuccess] = useState(false);

useEffect(() => {
  if (state.success) setShowSuccess(true);
}, [state.success]);

const handleCloseModal = () => {
  formRef.current?.reset();
  setFileName('');
  setShowSuccess(false);
};

// ...
{showSuccess && <SuccessModal onClose={handleCloseModal} />}
```

Теперь `useEffect` поднимает флаг при успехе action, а `handleCloseModal` может его опустить — кнопка «Закрыть», клик по фону и Escape работают штатно.

### Lightbox: стрелки и крестик закрывали модалку вместо переключения/закрытия по кнопке

**Симптом.** В галерее после открытия фото клик на «вперёд», «назад» или «закрыть» просто закрывал Lightbox — слайдер не работал.

**Причина.** В [src/components/Gallery/Lightbox.js](src/components/Gallery/Lightbox.js) кнопки стрелок и крестика были прямыми потомками `<div class="backdrop">`, на котором висел `onClick={onClose}`. Клик на кнопке вызывал её обработчик (`onPrev`/`onNext`/`onClose`), но событие продолжало всплывать до backdrop и сразу триггерило `onClose` — поэтому модалка закрывалась всегда. `stopPropagation` стоял только на внутреннем `.content`, стрелки его не наследовали, т. к. лежали рядом с ним, а не внутри.

**Фикс.** Заменил обработчик backdrop на проверку источника клика:

```js
const handleBackdropClick = (e) => {
  if (e.target === e.currentTarget) onClose();
};
```

Теперь `onClose` вызывается только при клике именно по затемнённому фону. Клики по любым потомкам (стрелки, крестик, контент) отрабатывают свои обработчики без побочного закрытия. Заодно убрал лишний `stopPropagation` с `.content` — он больше не нужен.
