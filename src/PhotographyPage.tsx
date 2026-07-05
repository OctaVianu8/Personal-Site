import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./navbar/Navbar";

const ACCENT = "var(--color-accent)";
const ACCENT_SOFT = "var(--color-accent-soft)";
const BG = "transparent";
const CARD = "var(--color-card)";
const BORDER = "var(--color-border)";
const TEXT = "var(--color-text)";
const FAINT = "var(--color-faint)";
const FONT_DISPLAY = "var(--font-display)";
const FONT_MONO = "var(--font-display)";

interface Album {
  id: number;
  name: string;
  slug: string;
  photo_count: number;
  preview_photos: string[];
}

interface Photo {
  id: number;
  filename: string;
  display_order: number;
}

const GRID_STYLES = `
  .pg-masonry {
    column-count: 3;
    column-gap: 12px;
  }
  .pg-item {
    break-inside: avoid;
    margin-bottom: 12px;
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-sm);
    cursor: pointer;
    border: 1px solid var(--color-border);
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
  }
  .pg-item img {
    display: block;
    width: 100%;
    transition: filter 0.3s ease, transform 0.3s ease;
  }
  .pg-item:hover img {
    filter: brightness(1.12);
    transform: scale(1.03);
  }
  .pg-overlay {
    position: absolute;
    inset: 0;
    background: var(--color-accent-soft);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  .pg-item:hover .pg-overlay {
    opacity: 1;
  }
  .album-card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    cursor: pointer;
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    backdrop-filter: blur(22px) saturate(150%);
    -webkit-backdrop-filter: blur(22px) saturate(150%);
    transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
  }
  .album-card:hover {
    border-color: var(--color-accent-border);
    background: var(--color-card-strong);
    transform: translateY(-2px);
  }
  .albums-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  @media (max-width: 900px) {
    .pg-masonry { column-count: 2; }
    .albums-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 600px) {
    .pg-masonry { column-count: 1; }
    .albums-grid { grid-template-columns: 1fr; }
  }
`;

function Lightbox({
  photos,
  albumId,
  idx,
  onClose,
  onPrev,
  onNext,
}: {
  photos: Photo[];
  albumId: number;
  idx: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  const btnBase: React.CSSProperties = {
    position: "fixed",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.7)",
    fontFamily: FONT_MONO,
    fontSize: "1.25rem",
    width: "2.75rem",
    height: "2.75rem",
    borderRadius: "999px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s ease, color 0.15s ease",
    zIndex: 1002,
  };

  const photo = photos[idx];

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <button
        onClick={onClose}
        style={{ position: "fixed", top: "1.5rem", right: "2rem", background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontFamily: FONT_MONO, fontSize: "1.75rem", cursor: "pointer", lineHeight: 1, zIndex: 1002, transition: "color 0.15s ease" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
      >
        ×
      </button>
      <button
        onClick={e => { e.stopPropagation(); onPrev(); }}
        style={{ ...btnBase, left: "2rem" }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
      >
        ←
      </button>
      <img
        src={`/api/photos/album-${albumId}/${photo.filename}`}
        alt=""
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: "var(--radius-sm)", zIndex: 1001, display: "block" }}
      />
      <button
        onClick={e => { e.stopPropagation(); onNext(); }}
        style={{ ...btnBase, right: "2rem" }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
      >
        →
      </button>
      <span style={{ position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)", fontFamily: FONT_MONO, fontSize: "0.78rem", color: FAINT, zIndex: 1002 }}>
        {idx + 1} / {photos.length}
      </span>
    </div>
  );
}

function AlbumCard({ album, onClick }: { album: Album; onClick: () => void }) {
  const [idx, setIdx] = useState(0);
  const photos = album.preview_photos ?? [];

  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(() => setIdx(i => (i + 1) % photos.length), 3000);
    return () => clearInterval(id);
  }, [photos.length]);

  return (
    <div className="album-card" onClick={onClick}>
      <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: CARD }}>
        {photos.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: "3rem", fontWeight: 800, color: "rgba(255,255,255,0.12)" }}>
              {album.name.charAt(0).toUpperCase()}
            </span>
          </div>
        ) : (
          photos.map((filename, i) => (
            <img
              key={filename}
              src={`/api/photos/album-${album.id}/${filename}`}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: i === idx ? 1 : 0,
                transition: "opacity 0.8s ease",
              }}
            />
          ))
        )}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(11,10,16,0.82) 0%, transparent 55%)",
          pointerEvents: "none",
        }} />
        {photos.length > 1 && (
          <div style={{
            position: "absolute",
            bottom: "0.6rem",
            right: "0.75rem",
            display: "flex",
            gap: "4px",
          }}>
            {photos.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === idx ? "1.2rem" : "4px",
                  height: "3px",
                  borderRadius: "999px",
                  background: i === idx ? ACCENT : "rgba(255,255,255,0.35)",
                  transition: "width 0.3s ease, background 0.3s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: "0.9rem 1.1rem 1.1rem" }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: "1rem", color: TEXT, fontWeight: 700, lineHeight: 1.35, marginBottom: "0.25rem" }}>
          {album.name.toUpperCase()}
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: "0.82rem", color: FAINT }}>
          {album.photo_count} photos
        </div>
      </div>
    </div>
  );
}

function AlbumList({ onSelect }: { onSelect: (slug: string) => void }) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/albums")
      .then(r => { if (!r.ok) throw new Error("Failed to load albums"); return r.json(); })
      .then(setAlbums)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <style>{GRID_STYLES}</style>
      <Navbar />
      <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "8rem 1.25rem 3rem" }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(3rem, 8vw, 5.8rem)", color: TEXT, fontWeight: 800, lineHeight: 0.98, marginBottom: "0.8rem" }}>
          PHOTOGRAPHY
        </h1>
        <div style={{ width: "3.5rem", height: "3px", borderRadius: "999px", background: ACCENT, marginBottom: "1.5rem" }} />

        {error && <p style={{ color: "var(--color-danger)", fontFamily: FONT_MONO, fontSize: "0.92rem" }}>{error}</p>}
        {loading && <p style={{ color: FAINT, fontFamily: FONT_MONO, fontSize: "0.92rem" }}>Loading...</p>}

        <div className="albums-grid">
          {albums.map(album => (
            <AlbumCard key={album.id} album={album} onClick={() => onSelect(album.slug)} />
          ))}
        </div>
      </div>

      <div id="contact" style={{ maxWidth: "72rem", margin: "0 auto", padding: "2rem 1.25rem 3rem", borderTop: `1px solid ${BORDER}` }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: "0.82rem", color: FAINT, lineHeight: "1.7", textAlign: "right" }}>
          © 2025 Octavian Stănescu — Built with React + Vite, deployed on Cloudflare Pages
        </p>
      </div>
    </div>
  );
}

function AlbumView({ slug, onBack }: { slug: string; onBack: () => void }) {
  const [album, setAlbum] = useState<(Album & { photos: Photo[] }) | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/albums/${slug}`)
      .then(r => { if (!r.ok) throw new Error("Album not found"); return r.json(); })
      .then(setAlbum)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [slug]);

  const open = (i: number) => setLightboxIdx(i);
  const close = useCallback(() => setLightboxIdx(null), []);
  const prev = useCallback(() => setLightboxIdx(i => (i !== null ? Math.max(0, i - 1) : null)), []);
  const next = useCallback(() => setLightboxIdx(i => (i !== null && album ? Math.min(album.photos.length - 1, i + 1) : null)), [album]);

  return (
    <div style={{ background: BG, minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <style>{GRID_STYLES}</style>
      <Navbar />
      <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "8rem 1.25rem 3rem" }}>
        <button
          onClick={onBack}
          style={{ background: ACCENT_SOFT, border: `1px solid ${BORDER}`, borderRadius: "999px", color: ACCENT, fontFamily: FONT_MONO, fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", padding: "0.55rem 0.9rem", marginBottom: "2.5rem", display: "block" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = ACCENT)}
        >
          ← ALL ALBUMS
        </button>

        {error && <p style={{ color: "var(--color-danger)", fontFamily: FONT_MONO, fontSize: "0.92rem" }}>{error}</p>}
        {loading && <p style={{ color: FAINT, fontFamily: FONT_MONO, fontSize: "0.92rem" }}>Loading...</p>}

        {album && (
          <>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(3rem, 8vw, 5.8rem)", color: TEXT, fontWeight: 800, lineHeight: 0.98, marginBottom: "0.8rem" }}>
              {album.name.toUpperCase()}
            </h1>
            <div style={{ width: "3.5rem", height: "3px", borderRadius: "999px", background: ACCENT, marginBottom: "2.5rem" }} />

            <div className="pg-masonry">
              {album.photos.map((photo, i) => (
                <div key={photo.id} className="pg-item" onClick={() => open(i)}>
                  <img src={`/api/photos/album-${album.id}/${photo.filename}`} alt="" loading="lazy" />
                  <div className="pg-overlay" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div id="contact" style={{ maxWidth: "72rem", margin: "0 auto", padding: "2rem 1.25rem 3rem", borderTop: `1px solid ${BORDER}` }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: "0.82rem", color: FAINT, lineHeight: "1.7", textAlign: "right" }}>
          © 2025 Octavian Stănescu — Built with React + Vite, deployed on Cloudflare Pages
        </p>
      </div>

      {lightboxIdx !== null && album && (
        <Lightbox photos={album.photos} albumId={album.id} idx={lightboxIdx} onClose={close} onPrev={prev} onNext={next} />
      )}
    </div>
  );
}

export default function PhotographyPage() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();

  if (slug) {
    return <AlbumView slug={slug} onBack={() => navigate("/photography")} />;
  }
  return <AlbumList onSelect={slug => navigate(`/photography/${slug}`)} />;
}
