import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./homepage/HomePage";
import PhotographyPage from "./PhotographyPage";
import AdminPage from "./AdminPage";
import DarkVeil from "./components/DarkVeil";
import styles from "./App.module.css";

export default function App() {
  return (
    <div className={styles.shell}>
      <div className={styles.veil} aria-hidden="true">
        <DarkVeil
          hueShift={140}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.4}
          scanlineFrequency={0}
          warpAmount={0}
          resolutionScale={1}
        />
      </div>
      <div className={styles.routes}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/photography" element={<PhotographyPage />} />
            <Route path="/photography/:slug" element={<PhotographyPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}
