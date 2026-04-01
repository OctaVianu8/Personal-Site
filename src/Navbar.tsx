import { useState, useEffect } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
      <span className="navbar__logo">OS</span>

      <div className="navbar__links">
        {["About", "Projects", "CP"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="navbar__link"
          >
            {item}
          </a>
        ))}
        <a
          href="/CV.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="navbar__cv"
        >
          CV
        </a>
      </div>
    </nav>
  );
}
