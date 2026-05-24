import { useTheme } from '../hooks/useTheme';
import styles from './ThemeSwitcher.module.css';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes: ('professional' | 'whimsical' | 'retro')[] = ['professional', 'whimsical', 'retro'];

  const handleCycleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <button className={styles.easterEgg} onClick={handleCycleTheme} aria-label="Toggle theme">
      [ layout: {theme} ]
    </button>
  );
}
