import Navbar from "./Navbar";
import Hero from "./Hero";
import About from "./About";
import Experience from "./Experience";
import Projects from "./Projects";
import CompetitiveProgramming from "./CompetitiveProgramming";
import Contact from "./Contact";

export default function App() {
  return (
    <div style={{ background: "#050508", minHeight: "100vh" }}>
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
