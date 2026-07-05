import { useState, useEffect } from "react";
import { useFadeIn } from "../useFadeIn";
import styles from "./Projects.module.css";

const GITHUB_USERNAME = "OctaVianu8";

const EXTRA_REPOS: string[] = [
  "ErikoNitu/Local-Vibe",
];

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  html_url: string;
  fork: boolean;
  stargazers_count: number;
}

interface Project {
  name: string;
  desc: string;
  lang: string;
  tags: string[];
  url: string;
}

export default function Projects() {
  const { ref, visible } = useFadeIn(0.08);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const response = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`,
        {
          headers: {
            Accept: "application/vnd.github+json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("GitHub API returned " + response.status);
      }

      const repos: GitHubRepo[] = await response.json();

      const extraPromises = EXTRA_REPOS.map(async (fullName) => {
        const res = await fetch(`https://api.github.com/repos/${fullName}`, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!res.ok) return null;
        return res.json() as Promise<GitHubRepo>;
      });
      const extraRepos = (await Promise.all(extraPromises)).filter(
        (repo): repo is GitHubRepo => repo !== null
      );

      const allRepos = [
        ...repos.filter((repo) => !repo.fork),
        ...extraRepos,
      ];
      allRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);

      const displayProjects: Project[] = allRepos.map((repo) => ({
        name: repo.name,
        desc: repo.description || "",
        lang: repo.language || "",
        tags: repo.topics,
        url: repo.html_url,
      }))
      .filter((project) => project.desc !== "")
      .slice(0, 6);

      setProjects(displayProjects);
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError("Could not load projects from GitHub.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="projects" className={styles.section}>
      <div ref={ref} className={`${styles.content}${visible ? ` ${styles.visible}` : ""}`}>
        <h2 className="sectionHeading">GitHub Projects</h2>

        {loading && (
          <p className={styles.loadingText}>Loading projects...</p>
        )}

        {error && (
          <p className={styles.errorText}>{error}</p>
        )}

        <div className={styles.grid}>
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
    >
      <h3 className={styles.cardTitle}>
        {project.name}
        {project.lang && (
          <span className={styles.langBadge}> ({project.lang})</span>
        )}
      </h3>

      <p className={styles.cardDesc}>
        {project.desc}
      </p>

      {project.tags.length > 0 && (
        <div className={styles.tags}>
          {project.tags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}
    </a>
  );
}
