import Navbar from "./Navbar";
import Hero from "./Hero";
import styles from "./App.module.css";

export default function App() {
  return (
    <div className={styles.app}>
      <Navbar />
      <Hero />
    </div>
  );
}
