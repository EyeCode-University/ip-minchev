import mapData from '@/lib/russiaMapData.json';
import styles from './RussiaMap.module.css';

/*
  Dotted map России.
  Данные (outline + сетка точек + координаты городов) предвычислены
  скриптом scripts/generate-russia-map.mjs из Natural Earth 50m через d3-geo,
  поэтому здесь — только отрисовка.
*/

const [, , VB_W, VB_H] = mapData.viewBox;
const DOT_RADIUS = 3;

export default function RussiaMap() {
  return (
    <svg
      className={styles.map}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Карта России с отмеченными городами поставок"
    >
      {mapData.dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={DOT_RADIUS} className={styles.dot} />
      ))}

      {mapData.cities.map((city) => (
        <g key={city.name} className={styles.cityGroup}>
          <circle className={styles.pulse} cx={city.x} cy={city.y} r="46" />
          <circle className={styles.cityDot} cx={city.x} cy={city.y} r="3" />
          <text
            className={styles.label}
            x={city.x}
            y={city.y - 14}
            textAnchor="middle"
          >
            {city.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
