# Fixed Issues

Журнал исправленных багов в проекте.

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
