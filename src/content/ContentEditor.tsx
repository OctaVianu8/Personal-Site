import { useState, useEffect } from "react";
import styles from "./ContentEditor.module.css";
import {
  DEFAULTS,
  type SiteContent,
  type HeroContent,
  type AboutContent,
  type ExperienceContent,
  type AwardsContent,
  type ContactContent,
  type AwardItem,
} from "./defaults";

type ContentSubTab = "hero" | "about" | "experience" | "awards" | "contact";

export default function ContentEditor({
  onNotice,
  onError,
}: {
  onNotice: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [tab, setTab] = useState<ContentSubTab>("hero");
  const [content, setContent] = useState<SiteContent>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/content")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: Partial<SiteContent>) => {
        if (!active) return;
        setContent({
          hero: data.hero ?? DEFAULTS.hero,
          about: data.about ?? DEFAULTS.about,
          experience: data.experience ?? DEFAULTS.experience,
          awards: data.awards ?? DEFAULTS.awards,
          contact: data.contact ?? DEFAULTS.contact,
        });
      })
      .catch((err) => {
        console.error("Could not fetch remote content:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function saveBlock<K extends keyof SiteContent>(key: K, data: SiteContent[K]) {
    setSaving(true);
    try {
      const res = await fetch(`/api/content/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Save failed (${res.status})`);
      }
      onNotice(`Saved ${key.toUpperCase()} section successfully.`);
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className={styles.loadingWrap}>Loading site content...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.subTabs}>
        {(["hero", "about", "experience", "awards", "contact"] as ContentSubTab[]).map(
          (t) => (
            <button
              key={t}
              type="button"
              className={`${styles.subTabBtn} ${tab === t ? styles.subTabActive : ""}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          )
        )}
      </div>

      <div className={styles.tabContent}>
        {tab === "hero" && (
          <HeroForm
            data={content.hero}
            saving={saving}
            onSave={(updated) => {
              setContent((prev) => ({ ...prev, hero: updated }));
              void saveBlock("hero", updated);
            }}
          />
        )}
        {tab === "about" && (
          <AboutForm
            data={content.about}
            saving={saving}
            onSave={(updated) => {
              setContent((prev) => ({ ...prev, about: updated }));
              void saveBlock("about", updated);
            }}
          />
        )}
        {tab === "experience" && (
          <ExperienceForm
            data={content.experience}
            saving={saving}
            onSave={(updated) => {
              setContent((prev) => ({ ...prev, experience: updated }));
              void saveBlock("experience", updated);
            }}
          />
        )}
        {tab === "awards" && (
          <AwardsForm
            data={content.awards}
            saving={saving}
            onSave={(updated) => {
              setContent((prev) => ({ ...prev, awards: updated }));
              void saveBlock("awards", updated);
            }}
          />
        )}
        {tab === "contact" && (
          <ContactForm
            data={content.contact}
            saving={saving}
            onSave={(updated) => {
              setContent((prev) => ({ ...prev, contact: updated }));
              void saveBlock("contact", updated);
            }}
          />
        )}
      </div>
    </div>
  );
}

// ----------------- Hero Form -----------------
function HeroForm({
  data,
  saving,
  onSave,
}: {
  data: HeroContent;
  saving: boolean;
  onSave: (val: HeroContent) => void;
}) {
  const [stats, setStats] = useState(data.stats);

  useEffect(() => {
    setStats(data.stats);
  }, [data.stats]);

  return (
    <div className={styles.formCard}>
      <div className={styles.formHeader}>
        <div>
          <h3>Hero Stats</h3>
          <p>Key highlights displayed prominently at the top of the homepage.</p>
        </div>
        <button
          type="button"
          className={styles.saveBtn}
          disabled={saving}
          onClick={() => onSave({ stats })}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      <div className={styles.itemList}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.row}>
            <input
              type="text"
              placeholder="Value (e.g. Jane Street)"
              value={stat.value}
              onChange={(e) => {
                const next = [...stats];
                next[i] = { ...next[i], value: e.target.value };
                setStats(next);
              }}
            />
            <input
              type="text"
              placeholder="Label (e.g. SWE Intern)"
              value={stat.label}
              onChange={(e) => {
                const next = [...stats];
                next[i] = { ...next[i], label: e.target.value };
                setStats(next);
              }}
            />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => setStats(stats.filter((_, idx) => idx !== i))}
              title="Remove stat"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={styles.addBtn}
        onClick={() => setStats([...stats, { value: "", label: "" }])}
      >
        + Add highlight stat
      </button>
    </div>
  );
}

// ----------------- About Form -----------------
function AboutForm({
  data,
  saving,
  onSave,
}: {
  data: AboutContent;
  saving: boolean;
  onSave: (val: AboutContent) => void;
}) {
  const [paragraphs, setParagraphs] = useState(data.paragraphs);

  useEffect(() => {
    setParagraphs(data.paragraphs);
  }, [data.paragraphs]);

  return (
    <div className={styles.formCard}>
      <div className={styles.formHeader}>
        <div>
          <h3>About Section</h3>
          <p>Bio paragraphs shown on the About section.</p>
        </div>
        <button
          type="button"
          className={styles.saveBtn}
          disabled={saving}
          onClick={() => onSave({ paragraphs })}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      <div className={styles.itemList}>
        {paragraphs.map((p, i) => (
          <div key={i} className={styles.textAreaRow}>
            <div className={styles.textAreaHeader}>
              <span>Paragraph {i + 1}</span>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => setParagraphs(paragraphs.filter((_, idx) => idx !== i))}
              >
                Remove
              </button>
            </div>
            <textarea
              rows={4}
              value={p}
              onChange={(e) => {
                const next = [...paragraphs];
                next[i] = e.target.value;
                setParagraphs(next);
              }}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        className={styles.addBtn}
        onClick={() => setParagraphs([...paragraphs, ""])}
      >
        + Add paragraph
      </button>
    </div>
  );
}

// ----------------- Experience Form -----------------
function ExperienceForm({
  data,
  saving,
  onSave,
}: {
  data: ExperienceContent;
  saving: boolean;
  onSave: (val: ExperienceContent) => void;
}) {
  const [entries, setEntries] = useState(data.entries);

  useEffect(() => {
    setEntries(data.entries);
  }, [data.entries]);

  return (
    <div className={styles.formCard}>
      <div className={styles.formHeader}>
        <div>
          <h3>Experience Timeline</h3>
          <p>Past & upcoming roles, internships, teaching assistant positions.</p>
        </div>
        <button
          type="button"
          className={styles.saveBtn}
          disabled={saving}
          onClick={() => onSave({ entries })}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      <div className={styles.itemList}>
        {entries.map((entry, i) => (
          <div key={i} className={styles.blockRow}>
            <div className={styles.blockRowHeader}>
              <strong>Entry #{i + 1}</strong>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => setEntries(entries.filter((_, idx) => idx !== i))}
              >
                Remove
              </button>
            </div>
            <div className={styles.grid2}>
              <input
                type="text"
                placeholder="Role (e.g. Software Engineering Intern)"
                value={entry.role}
                onChange={(e) => {
                  const next = [...entries];
                  next[i] = { ...next[i], role: e.target.value };
                  setEntries(next);
                }}
              />
              <input
                type="text"
                placeholder="Organization (e.g. Jane Street)"
                value={entry.org}
                onChange={(e) => {
                  const next = [...entries];
                  next[i] = { ...next[i], org: e.target.value };
                  setEntries(next);
                }}
              />
            </div>
            <input
              type="text"
              placeholder="Year / Period (e.g. Summer 2027 or 2026 – Present)"
              value={entry.year}
              onChange={(e) => {
                const next = [...entries];
                next[i] = { ...next[i], year: e.target.value };
                setEntries(next);
              }}
            />
            <textarea
              rows={2}
              placeholder="Description"
              value={entry.desc}
              onChange={(e) => {
                const next = [...entries];
                next[i] = { ...next[i], desc: e.target.value };
                setEntries(next);
              }}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        className={styles.addBtn}
        onClick={() =>
          setEntries([
            ...entries,
            { role: "", org: "", year: "", desc: "" },
          ])
        }
      >
        + Add experience item
      </button>
    </div>
  );
}

// ----------------- Awards Form -----------------
function AwardsForm({
  data,
  saving,
  onSave,
}: {
  data: AwardsContent;
  saving: boolean;
  onSave: (val: AwardsContent) => void;
}) {
  const [items, setItems] = useState(data.items);

  useEffect(() => {
    setItems(data.items);
  }, [data.items]);

  return (
    <div className={styles.formCard}>
      <div className={styles.formHeader}>
        <div>
          <h3>Honors & Awards</h3>
          <p>Olympiad medals, competitions, and problem setting contributions.</p>
        </div>
        <button
          type="button"
          className={styles.saveBtn}
          disabled={saving}
          onClick={() => onSave({ items })}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      <div className={styles.itemList}>
        {items.map((item, i) => (
          <div key={i} className={styles.blockRow}>
            <div className={styles.blockRowHeader}>
              <strong>Award #{i + 1} {i === 0 && <span className={styles.featuredBadge}>Featured</span>}</strong>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              >
                Remove
              </button>
            </div>
            <div className={styles.grid3}>
              <select
                value={item.icon || "award"}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = {
                    ...next[i],
                    icon: e.target.value as AwardItem["icon"],
                  };
                  setItems(next);
                }}
              >
                <option value="medal">Medal</option>
                <option value="trophy">Trophy</option>
                <option value="award">Award</option>
                <option value="pen">Pen / Problem Setter</option>
              </select>
              <input
                type="text"
                placeholder="Event (e.g. ONI 2024)"
                value={item.event}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], event: e.target.value };
                  setItems(next);
                }}
              />
              <input
                type="text"
                placeholder="Result (e.g. Gold Medal)"
                value={item.result}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], result: e.target.value };
                  setItems(next);
                }}
              />
            </div>
            <input
              type="text"
              placeholder="Description (e.g. National Informatics Olympiad)"
              value={item.desc}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], desc: e.target.value };
                setItems(next);
              }}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        className={styles.addBtn}
        onClick={() =>
          setItems([
            ...items,
            { icon: "award", event: "", result: "", desc: "" },
          ])
        }
      >
        + Add honor / award
      </button>
    </div>
  );
}

// ----------------- Contact Form -----------------
function ContactForm({
  data,
  saving,
  onSave,
}: {
  data: ContactContent;
  saving: boolean;
  onSave: (val: ContactContent) => void;
}) {
  const [links, setLinks] = useState(data.links);
  const [footer, setFooter] = useState(data.footer);

  useEffect(() => {
    setLinks(data.links);
    setFooter(data.footer);
  }, [data.links, data.footer]);

  return (
    <div className={styles.formCard}>
      <div className={styles.formHeader}>
        <div>
          <h3>Contact & Footer</h3>
          <p>Social / email links and footer copyright text.</p>
        </div>
        <button
          type="button"
          className={styles.saveBtn}
          disabled={saving}
          onClick={() => onSave({ links, footer })}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>

      <div className={styles.itemList}>
        <h4>Links</h4>
        {links.map((link, i) => (
          <div key={i} className={styles.row}>
            <input
              type="text"
              placeholder="Label (e.g. GitHub)"
              value={link.label}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], label: e.target.value };
                setLinks(next);
              }}
            />
            <input
              type="text"
              placeholder="URL or mailto: link"
              value={link.href}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...next[i], href: e.target.value };
                setLinks(next);
              }}
            />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => setLinks(links.filter((_, idx) => idx !== i))}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => setLinks([...links, { label: "", href: "" }])}
        >
          + Add link
        </button>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <h4>Footer Text</h4>
        <input
          type="text"
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          placeholder="© 2025 ... Built with ..."
          style={{ width: "100%", marginTop: "0.5rem" }}
        />
      </div>
    </div>
  );
}

