import Navbar from "../navbar/Navbar";
import Hero from "../hero/Hero";
import About from "../about/About";
import Experience from "../experience/Experience";
import Projects from "../projects/Projects";
import GitHubHeatmap from "../projects/GitHubHeatmap";
import HonorsAndAwards from "../honors-and-awards/HonorsAndAwards";
import Contact from "../contact/Contact";
import styles from "../App.module.css";

export default function HomePage() {
  return (
    <div className={styles.app}>
      <Navbar />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <GitHubHeatmap />
      <HonorsAndAwards />
      <Contact />
    </div>
  );
}
