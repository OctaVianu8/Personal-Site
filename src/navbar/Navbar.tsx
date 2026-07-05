import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";

const ANCHOR_LINKS = [
  { label: "About", hash: "#about" },
  { label: "Projects", hash: "#projects" },
  { label: "Competitive Programming", hash: "#competitive-programming" },
  { label: "Contact", hash: "#contact" },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const onHome = location.pathname === "/";
  const onPhoto = location.pathname === "/photography";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={scrolled ? `${styles.navbar} ${styles.scrolled}` : styles.navbar}>
      <Link to="/" className={styles.logo}>OS</Link>

      <div className={styles.links}>
        {ANCHOR_LINKS.map(({ label, hash }) => (
          <a
            key={label}
            href={onHome ? hash : `/${hash}`}
            className={styles.link}
          >
            {label}
          </a>
        ))}

        <Link
          to="/photography"
          className={`${styles.link}${onPhoto ? ` ${styles.linkActive}` : ""}`}
        >
          Photography
        </Link>

        <a
          href="/CV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cv}
        >
          CV
        </a>
      </div>
    </nav>
  );
}
