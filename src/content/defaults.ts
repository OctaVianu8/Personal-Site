// ---------------------------------------------------------------------------
// Site content types & hardcoded defaults (used as fallback when the DB has
// no entry for a given content block).
// ---------------------------------------------------------------------------

export interface HeroContent {
  stats: { value: string; label: string }[];
}

export interface AboutContent {
  paragraphs: string[];
}

export interface ExperienceEntry {
  role: string;
  org: string;
  year: string;
  desc: string;
}

export interface ExperienceContent {
  entries: ExperienceEntry[];
}

export interface AwardItem {
  event: string;
  result: string;
  desc: string;
  icon: "pen" | "medal" | "trophy" | "award";
}

export interface AwardsContent {
  items: AwardItem[];
}

export interface ContactLink {
  label: string;
  href: string;
}

export interface ContactContent {
  links: ContactLink[];
  footer: string;
}

export interface SiteContent {
  hero: HeroContent;
  about: AboutContent;
  experience: ExperienceContent;
  awards: AwardsContent;
  contact: ContactContent;
}

// ---- Defaults (current hardcoded values) ----------------------------------

export const DEFAULTS: SiteContent = {
  hero: {
    stats: [
      { value: "Jane Street", label: "SWE Intern — Summer 2027" },
      { value: "ACS UPB", label: "Teaching Assistant" },
      { value: "CEOI", label: "Problem Setter" },
      { value: "RCPC", label: "Bronze Medalist" },
    ],
  },

  about: {
    paragraphs: [
      "I'm a CS student at UPB Bucharest, competitive programmer, and incoming SWE intern at Jane Street (Summer 2027). I previously interned at AMIQ EDA and was selected for the Discover Citadel program. I placed Bronze at RCPC 2025 and 2024 (Romanian Collegiate Programming Contest) and Gold at ONI 2024 (National CS Olympiad). I also served as a problem setter for CEOI (Central European Olympiad in Informatics).",
      "I'm currently a Teaching Assistant for Algorithm Analysis and Object-Oriented Programming at ACS UPB. I have a strong interest in competitive programming, algorithms, and software engineering. I enjoy solving challenging problems and learning new things. I am always looking for opportunities to improve my skills and contribute to interesting projects.",
      "In my free time, I enjoy photography, hiking, and exploring new places. I also like to read about technology, and science, and play chess, bridge and poker.",
    ],
  },

  experience: {
    entries: [
      {
        role: "Software Engineering Intern",
        org: "Jane Street",
        year: "2027 (upcoming)",
        desc: "Incoming SWE intern at Jane Street for Summer 2027.",
      },
      {
        role: "Teaching Assistant",
        org: "ACS UPB",
        year: "2026 – Present",
        desc: "Teaching Assistant for Algorithm Analysis and Object-Oriented Programming.",
      },
      {
        role: "Software Engineering Intern",
        org: "AMIQ EDA",
        year: "2026",
        desc: "Worked as a SWE intern at AMIQ EDA, a leading provider of EDA solutions for the semiconductor industry.",
      },
      {
        role: "Discover Program",
        org: "Citadel",
        year: "2026",
        desc: "Selected for Citadel's exclusive program for top European CS students.",
      },
      {
        role: "Problem Setter",
        org: "CEOI",
        year: "2025",
        desc: "Designed and validated competition problems for the Central European Olympiad in Informatics.",
      },
    ],
  },

  awards: {
    items: [
      { icon: "pen", event: "CEOI 2025", result: "Problem Setter", desc: "Central European Olympiad in Informatics" },
      { icon: "medal", event: "RCPC 2025", result: "4th Place, Bronze Medal", desc: "Romanian Collegiate Programming Contest, Bucharest" },
      { icon: "trophy", event: "ONI 2024", result: "3rd Prize, Gold Medal", desc: "National Informatics Olympiad, Bucharest" },
      { icon: "medal", event: "RCPC 2024", result: "4th Place, Bronze Medal", desc: "Romanian Collegiate Programming Contest, Bucharest" },
      { icon: "award", event: "ONI 2023", result: "Honorable Mention, Silver Medal", desc: "National Informatics Olympiad, Bucharest" },
      { icon: "award", event: "National Physics Olympiad 2023", result: "National Team Qualification, Silver Medal", desc: "National Physics Olympiad, Oradea" },
      { icon: "award", event: "ONI 2022", result: "Silver Medal", desc: "National Informatics Olympiad" },
      { icon: "medal", event: "Mathematics", result: "1 Silver, 2 Bronze Medals", desc: "National Mathematics Olympiad" },
    ],
  },

  contact: {
    links: [
      { label: "Email", href: "mailto:stanescu.matei.octavian@gmail.com" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/octavianu/" },
      { label: "GitHub", href: "https://github.com/OctaVianu8" },
    ],
    footer: "© 2025 Octavian Stănescu; Built with React + Vite, deployed on Cloudflare Pages",
  },
};

