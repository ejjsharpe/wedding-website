import { useState } from "react";
import styles from "./Header.module.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <a href="/" className={styles.logo}>
          Elliot & Louise
        </a>
        <button
          className={styles.menuToggle}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
        </button>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}>
          <ul className={styles.navList}>
            <li>
              <a href="/venue" onClick={() => setIsMenuOpen(false)}>
                Venue
              </a>
            </li>
            <li>
              <a href="/rsvp" onClick={() => setIsMenuOpen(false)}>
                RSVP
              </a>
            </li>
            <li>
              <a href="/schedule" onClick={() => setIsMenuOpen(false)}>
                Schedule
              </a>
            </li>
            <li>
              <a href="/photos" onClick={() => setIsMenuOpen(false)}>
                Photos
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
