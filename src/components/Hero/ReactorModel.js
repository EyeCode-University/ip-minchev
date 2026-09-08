'use client';

import { useEffect, useRef } from 'react';
import {
  Renderer,
  Camera,
  Transform,
  Program,
  Mesh,
  Cylinder,
  Sphere,
  Torus,
  Vec2,
} from 'ogl';
import styles from './Hero.module.css';

/*
  Процедурная модель реакторного корпуса на OGL (фоновый «3-й элемент» Hero).
  Собрана из примитивов: цилиндрический корпус + нижний купол (полусфера),
  фланцы и сварные пояса, боковые патрубки с фланцами, верхняя решётчатая
  ферма (вертикальные тяги) с площадкой и кольцевым ограждением.
  Материал — псевдо-matcap «сталь»: студийный свет + френель в шейдере.
  Авто-вращение вокруг оси + параллакс наклона от курсора.
  Уважает prefers-reduced-motion (статичный кадр).
*/

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec3 normal;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  uniform vec3 uColor;
  uniform float uShine;
  uniform float uFres;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(-vViewPos);

    vec3 L1 = normalize(vec3(0.5, 0.85, 0.65));
    vec3 L2 = normalize(vec3(-0.65, 0.35, 0.45));
    vec3 L3 = normalize(vec3(0.0, -0.7, 0.55));

    float d1 = max(dot(N, L1), 0.0);
    float d2 = max(dot(N, L2), 0.0);
    float d3 = max(dot(N, L3), 0.0);

    vec3 H1 = normalize(L1 + V);
    vec3 H2 = normalize(L2 + V);
    float s1 = pow(max(dot(N, H1), 0.0), uShine);
    float s2 = pow(max(dot(N, H2), 0.0), uShine * 0.5);

    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);

    vec3 col = uColor * (0.30 + 0.55 * d1 + 0.30 * d2 + 0.15 * d3);
    col += vec3(1.0) * s1 * 0.9;
    col += vec3(0.80, 0.86, 1.0) * s2 * 0.5;
    col += vec3(0.55, 0.62, 0.85) * fres * uFres;

    // Холодный синий подмес под бренд / референс
    col = mix(col, col * vec3(0.90, 0.94, 1.12), 0.38);
    col = pow(col, vec3(0.85));

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`;

export default function ReactorModel() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Canvas создаём здесь, а не отдаём React: WebGL-контекст живёт на элементе
    // и после loseContext() в cleanup остаётся мёртвым навсегда. Переиспользуй
    // мы один и тот же <canvas>, повторный прогон эффекта (Strict Mode, Fast
    // Refresh, ре-маунт) получил бы потерянный контекст — программа не
    // слинковалась бы, а OGL молча оставляет Program.uniformLocations пустым
    // и падает уже на первом кадре. Свежий элемент на каждый прогон — свежий
    // контекст.
    const canvas = document.createElement('canvas');
    host.appendChild(canvas);

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let renderer;
    try {
      renderer = new Renderer({
        canvas,
        dpr: Math.min(window.devicePixelRatio, 2),
        alpha: true,
        antialias: true,
      });
    } catch {
      canvas.remove();
      return;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 30, near: 0.1, far: 100 });
    camera.position.set(0, 0, 10.5);
    camera.lookAt([0, 0, 0]);

    const scene = new Transform();
    const root = new Transform(); // наклон + параллакс
    root.setParent(scene);
    root.position.y = -0.3; // центрируем модель в верхней полосе слоя
    root.scale.set(0.68, 0.68, 0.68); // общий масштаб модели
    const spinner = new Transform(); // вращение вокруг своей оси
    spinner.setParent(root);

    // Общие материалы (переиспользуются между мешами)
    const mkProg = (color, shine, fres) =>
      new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uColor: { value: color },
          uShine: { value: shine },
          uFres: { value: fres },
        },
      });
    const steel = mkProg([0.6, 0.64, 0.72], 50, 0.7);
    const darkSteel = mkProg([0.34, 0.38, 0.46], 70, 0.8);
    const chrome = mkProg([0.72, 0.76, 0.85], 120, 0.95);

    const add = (geometry, program, parent, t = {}) => {
      const mesh = new Mesh(gl, { geometry, program });
      if (t.position) mesh.position.set(...t.position);
      if (t.rotation) mesh.rotation.set(...t.rotation);
      mesh.setParent(parent || spinner);
      return mesh;
    };

    // --- Корпус ---
    add(new Cylinder(gl, { radiusTop: 0.85, radiusBottom: 0.85, height: 2.2, radialSegments: 72 }), steel);
    // Нижний купол (полусфера)
    add(new Sphere(gl, { radius: 0.85, widthSegments: 48, thetaStart: Math.PI / 2, thetaLength: Math.PI / 2 }), steel, spinner, { position: [0, -1.1, 0] });
    // Верхнее сужение
    add(new Cylinder(gl, { radiusTop: 0.6, radiusBottom: 0.85, height: 0.32, radialSegments: 72 }), steel, spinner, { position: [0, 1.26, 0] });

    // --- Фланцы и сварные пояса ---
    add(new Cylinder(gl, { radiusTop: 0.92, radiusBottom: 0.92, height: 0.18, radialSegments: 72 }), darkSteel, spinner, { position: [0, 1.04, 0] });
    [0.6, 0.0, -0.6].forEach((y) =>
      add(new Torus(gl, { radius: 0.86, tube: 0.022, radialSegments: 20, tubularSegments: 64 }), darkSteel, spinner, { position: [0, y, 0] })
    );
    add(new Torus(gl, { radius: 0.9, tube: 0.035, radialSegments: 24, tubularSegments: 72 }), darkSteel, spinner, { position: [0, -1.05, 0] });

    // --- Боковые патрубки с фланцами (4 спереди, 2 ряда) ---
    const addNozzle = (angle, y) => {
      const g = new Transform();
      g.setParent(spinner);
      g.rotation.y = angle;
      const reach = 0.85;
      add(new Cylinder(gl, { radiusTop: 0.13, radiusBottom: 0.14, height: 0.42, radialSegments: 28 }), darkSteel, g, { position: [0, y, reach + 0.21], rotation: [Math.PI / 2, 0, 0] });
      add(new Cylinder(gl, { radiusTop: 0.2, radiusBottom: 0.2, height: 0.08, radialSegments: 28 }), chrome, g, { position: [0, y, reach + 0.44], rotation: [Math.PI / 2, 0, 0] });
    };
    [-0.5, 0.5].forEach((y) => {
      addNozzle(-0.42, y);
      addNozzle(0.42, y);
    });
    // Малый смотровой люк по центру фронта
    add(new Cylinder(gl, { radiusTop: 0.11, radiusBottom: 0.11, height: 0.06, radialSegments: 28 }), darkSteel, spinner, { position: [0, 0, 0.85], rotation: [Math.PI / 2, 0, 0] });

    // --- Верхняя решётчатая ферма ---
    // Опорная палуба
    add(new Cylinder(gl, { radiusTop: 0.6, radiusBottom: 0.62, height: 0.12, radialSegments: 48 }), darkSteel, spinner, { position: [0, 1.5, 0] });
    // Вертикальные тяги (два кольца)
    const addRods = (count, radius, height, yCenter) => {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        add(new Cylinder(gl, { radiusTop: 0.022, radiusBottom: 0.022, height, radialSegments: 6 }), chrome, spinner, {
          position: [Math.cos(a) * radius, yCenter, Math.sin(a) * radius],
        });
      }
    };
    addRods(30, 0.5, 1.0, 2.06);
    addRods(18, 0.3, 1.0, 2.06);
    // Среднее кольцо-площадка
    add(new Cylinder(gl, { radiusTop: 0.56, radiusBottom: 0.56, height: 0.05, radialSegments: 48 }), darkSteel, spinner, { position: [0, 1.98, 0] });
    add(new Torus(gl, { radius: 0.55, tube: 0.025, radialSegments: 16, tubularSegments: 56 }), darkSteel, spinner, { position: [0, 1.98, 0] });
    // Верхняя площадка
    add(new Cylinder(gl, { radiusTop: 0.58, radiusBottom: 0.58, height: 0.06, radialSegments: 48 }), darkSteel, spinner, { position: [0, 2.58, 0] });
    // Кольцевое ограждение + стойки
    add(new Torus(gl, { radius: 0.56, tube: 0.016, radialSegments: 12, tubularSegments: 56 }), chrome, spinner, { position: [0, 2.76, 0] });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      add(new Cylinder(gl, { radiusTop: 0.012, radiusBottom: 0.012, height: 0.2, radialSegments: 6 }), chrome, spinner, {
        position: [Math.cos(a) * 0.56, 2.68, Math.sin(a) * 0.56],
      });
    }
    // Центральный штуцер сверху
    add(new Cylinder(gl, { radiusTop: 0.1, radiusBottom: 0.1, height: 0.16, radialSegments: 24 }), darkSteel, spinner, { position: [0, 2.66, 0] });

    // --- Ресайз ---
    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      renderer.setSize(w, h);
      camera.perspective({ aspect: w / Math.max(h, 1) });
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    // --- Параллакс от курсора ---
    const target = new Vec2(0, 0);
    const onPointer = (e) => {
      target.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * 2 - 1
      );
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    const baseTiltX = 0.16;
    let curX = baseTiltX;
    let curY = 0;

    let raf = 0;
    let onScreen = true;
    const loop = () => {
      curX += (baseTiltX - target.y * 0.18 - curX) * 0.05;
      curY += (target.x * 0.3 - curY) * 0.05;
      root.rotation.x = curX;
      root.rotation.y = curY;
      spinner.rotation.y += 0.0032;
      renderer.render({ scene, camera });
      raf = requestAnimationFrame(loop);
    };

    // Крутим только когда Hero на экране и вкладка активна — экономим GPU/батарею
    const start = () => {
      if (!raf && !reduceMotion && onScreen && !document.hidden) {
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        onScreen ? start() : stop();
      },
      { threshold: 0 }
    );
    io.observe(host);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    if (reduceMotion) {
      root.rotation.x = baseTiltX;
      spinner.rotation.y = 0.5;
      renderer.render({ scene, camera });
    } else {
      start();
    }

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
      canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className={styles.reactorCanvas} aria-hidden="true" />;
}
