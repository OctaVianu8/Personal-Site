import Navbar from "./Navbar";
import Hero from "./Hero";
import About from "./About";
import Experience from "./Experience";
import Projects from "./Projects";
import CompetitiveProgramming from "./CompetitiveProgramming";
import Contact from "./Contact";
import styles from "./App.module.css";

export default function HomePage() {
  return (
    <div className={styles.app}>
      <Navbar />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <CompetitiveProgramming />
      <Contact />
    </div>
  );
}
