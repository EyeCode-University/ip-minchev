/*
  Вставка JSON-LD в разметку. Серверный компонент: разметка обязана присутствовать
  в исходном HTML, иначе смысла в ней нет.

  `<` экранируем: в данных встречаются кавычки и спецсимволы, и последовательность
  вида `</script>` внутри JSON закрыла бы тег раньше времени.
*/
export default function JsonLd({ data }) {
  const json = JSON.stringify(data).replace(/</g, '\u003c');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
