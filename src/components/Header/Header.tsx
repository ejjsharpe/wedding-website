import { useState } from "react";
import styles from "./Header.module.css";

interface HeaderProps {
  theme?: "primary" | "secondary";
  hideLogoOnMobile?: boolean;
  menuOnRight?: boolean;
}

export default function Header({ theme = "primary" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`${styles.header} ${styles[theme]}`}>
      <div className={styles.headerContent}>
        <a href="/" className={styles.logo}>
          Elliot & Louise
        </a>
        <button
          className={`${styles.menuToggle} ${
            isMenuOpen ? styles.menuOpen : ""
          }`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
          <span className={styles.hamburger}></span>
        </button>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ""}`}>
          <ul className={styles.navList}>
            <li className={styles.mobileOnly}>
              <a href="/" onClick={() => setIsMenuOpen(false)}>
                Home
              </a>
            </li>
            <li>
              <a href="/travel" onClick={() => setIsMenuOpen(false)}>
                Travel & Stay
              </a>
            </li>
            {/* <li>
              <a href="/schedule" onClick={() => setIsMenuOpen(false)}>
                Schedule
              </a>
            </li>
            <li>
              <a href="/photos" onClick={() => setIsMenuOpen(false)}>
                Photos
              </a>
            </li> */}
            <li>
              <a href="/rsvp" onClick={() => setIsMenuOpen(false)}>
                RSVP
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
