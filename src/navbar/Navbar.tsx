import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";

type IconProps = {
  className?: string;
};

const CameraIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const FileTextIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);

const MenuIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const CloseIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const ANCHOR_LINKS = [
  { label: "About", hash: "#about" },
  { label: "Projects", hash: "#projects" },
  { label: "Honors and Awards", hash: "#honors-and-awards" },
  { label: "Contact", hash: "#contact" },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const onHome = location.pathname === "/";
  const onPhoto = location.pathname === "/photography";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={scrolled ? `${styles.navbar} ${styles.scrolled}` : styles.navbar}>
      <Link to="/" className={styles.logo}>OS</Link>

      <button
        type="button"
        className={styles.menuButton}
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation-menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <CloseIcon className={styles.menuIcon} /> : <MenuIcon className={styles.menuIcon} />}
      </button>

      <div
        id="mobile-navigation-menu"
        className={`${styles.links}${menuOpen ? ` ${styles.linksOpen}` : ""}`}
      >
        {ANCHOR_LINKS.map(({ label, hash }) => (
          <a
            key={label}
            href={onHome ? hash : `/${hash}`}
            className={styles.link}
            onClick={closeMenu}
          >
            {label}
          </a>
        ))}

        <Link
          to="/photography"
          className={`${styles.link}${onPhoto ? ` ${styles.linkActive}` : ""}`}
          onClick={closeMenu}
        >
          <CameraIcon className={styles.linkIcon} />
          Photography
        </Link>

        <a
          href="/CV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cv}
          onClick={closeMenu}
        >
          <FileTextIcon className={styles.cvIcon} />
          CV
        </a>
      </div>
    </nav>
  );
}
