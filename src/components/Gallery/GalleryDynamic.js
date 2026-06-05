'use client';

import dynamic from 'next/dynamic';

// Галерея использует FadeIn (motion) с анимациями входа, которые дают расхождение
// серверного и клиентского HTML → ошибка гидрации. Грузим её только на клиенте.
const Gallery = dynamic(() => import('./Gallery'), { ssr: false });

export default Gallery;
