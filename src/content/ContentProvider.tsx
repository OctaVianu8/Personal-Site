// ---------------------------------------------------------------------------
// Fetches editable site content from /api/content, falls back to hardcoded
// defaults so the page renders instantly and survives API failures.
// ---------------------------------------------------------------------------

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DEFAULTS, type SiteContent } from "./defaults";

const ContentContext = createContext<SiteContent>(DEFAULTS);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(DEFAULTS);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/content")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: Partial<SiteContent>) => {
        if (cancelled) return;
        setContent((prev) => ({
          hero: data.hero ?? prev.hero,
          about: data.about ?? prev.about,
          experience: data.experience ?? prev.experience,
          awards: data.awards ?? prev.awards,
          contact: data.contact ?? prev.contact,
        }));
      })
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ContentContext.Provider value={content}>
      {children}
    </ContentContext.Provider>
  );
}

/** Return one content block by key, with hardcoded fallback. */
export function useSiteContent<K extends keyof SiteContent>(
  key: K
): SiteContent[K] {
  return useContext(ContentContext)[key];
}

