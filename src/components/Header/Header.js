'use client';

import { useState, useEffect } from 'react';
import { NAV_LINKS, COMPANY } from '@/lib/constants';
import styles from './Header.module.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = () => setMenuOpen(false);
  const navLinks = NAV_LINKS.filter((l) => l.href !== '#request');

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.bar}>
        <a href="#hero" className={styles.logo} onClick={handleNavClick}>
          <span className={styles.logoMark} aria-hidden="true">M</span>
          <span className={styles.logoFull}>{COMPANY.name}</span>
          <span className={styles.logoShort}>{COMPANY.name}</span>
        </a>

        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
        </button>

        <nav
          className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}
          aria-label="Основная навигация"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={styles.navLink}
              onClick={handleNavClick}
            >
              {link.label}
            </a>
          ))}
          <a href="#request" className={styles.cta} onClick={handleNavClick}>
            Оставить заявку
          </a>
        </nav>
      </div>
    </header>
  );
}
