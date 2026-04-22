import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={scrolled ? `${styles.navbar} ${styles.scrolled}` : styles.navbar}>
      <span className={styles.logo}>OS</span>

      <div className={styles.links}>
        {([
          { label: "About", href: "#about" },
          { label: "Projects", href: "#projects" },
          { label: "Competitive Programming", href: "#competitive-programming" },
        ] as const).map(({ label, href }) => (
          <a key={label} href={href} className={styles.link}>
            {label}
          </a>
        ))}
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
