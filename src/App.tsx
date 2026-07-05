import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./homepage/HomePage";
import PhotographyPage from "./PhotographyPage";
import AdminPage from "./AdminPage";
import styles from "./App.module.css";

export default function App() {
  return (
    <div className={styles.shell}>
      <div className={styles.veil} aria-hidden="true" />
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
