// Генератор данных для dotted-map России.
// Читает Natural Earth 50m из world-atlas, проецирует Россию в SVG viewBox,
// раскладывает сетку точек по полигону и проецирует города.
// Результат пишется в src/lib/russiaMapData.json — его импортирует клиент.
//
// Запуск: `node scripts/generate-russia-map.mjs`

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { feature } from 'topojson-client';
import {
  geoMercator,
  geoPath,
  geoContains,
} from 'd3-geo';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const WIDTH = 1000;
const HEIGHT = 500;
const DOT_SPACING = 9;
const ROTATION = [-100, 0]; // центрируем на ~100°E чтобы Россия не рвалась через антимеридиан

const CITIES = [
  { name: 'Мурманск',         coords: [33.08, 68.97] },
  { name: 'Архангельск',      coords: [40.54, 64.54] },
  { name: 'Санкт-Петербург',  coords: [30.31, 59.94] },
  { name: 'Москва',           coords: [37.62, 55.75] },
  { name: 'Челябинск',        coords: [61.43, 55.16] },
  { name: 'Красноярск',       coords: [92.87, 56.02] },
  { name: 'Барнаул',          coords: [83.78, 53.35] },
];

async function main() {
  const topoPath = resolve(ROOT, 'node_modules/world-atlas/countries-50m.json');
  const topo = JSON.parse(await readFile(topoPath, 'utf8'));

  const countries = feature(topo, topo.objects.countries);
  const russia = countries.features.find((f) => f.id === '643'); // ISO 3166-1 numeric для России
  if (!russia) throw new Error('Russia feature not found');

  const projection = geoMercator()
    .rotate(ROTATION)
    .fitSize([WIDTH, HEIGHT], russia);

  const pathGen = geoPath(projection);
  const outlinePath = pathGen(russia);

  // Сетка точек: инвертируем SVG координату в lng/lat, проверяем попадание в Россию
  const dots = [];
  for (let x = 0; x <= WIDTH; x += DOT_SPACING) {
    for (let y = 0; y <= HEIGHT; y += DOT_SPACING) {
      const lngLat = projection.invert([x, y]);
      if (!lngLat) continue;
      if (geoContains(russia, lngLat)) {
        dots.push([x, y]);
      }
    }
  }

  const cities = CITIES.map((c) => {
    const [x, y] = projection(c.coords);
    return { name: c.name, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  });

  const out = {
    viewBox: [0, 0, WIDTH, HEIGHT],
    dotSpacing: DOT_SPACING,
    outline: outlinePath,
    dots,
    cities,
  };

  const outPath = resolve(ROOT, 'src/lib/russiaMapData.json');
  await writeFile(outPath, JSON.stringify(out));
  console.log(`wrote ${outPath}`);
  console.log(`dots: ${dots.length}, cities: ${cities.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
