import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const BLUE = "#3b82f6";
const FONT_DISPLAY = "'Bebas Neue', sans-serif";
const FONT_MONO = "'Space Mono', monospace";

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
    column-gap: 8px;
  }
  .pg-item {
    break-inside: avoid;
    margin-bottom: 8px;
    position: relative;
    overflow: hidden;
    border-radius: 2px;
    cursor: pointer;
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
    background: rgba(59, 130, 246, 0.15);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  .pg-item:hover .pg-overlay {
    opacity: 1;
  }
  .album-card {
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 2px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }
  .album-card:hover {
    border-color: #3b82f6;
    transform: translateY(-3px);
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
    borderRadius: "2px",
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
        style={{ maxWidth: "90vw", maxHeight: "85vh", objectFit: "contain", borderRadius: "2px", zIndex: 1001, display: "block" }}
      />
      <button
        onClick={e => { e.stopPropagation(); onNext(); }}
        style={{ ...btnBase, right: "2rem" }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
      >
        →
      </button>
      <span style={{ position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)", fontFamily: FONT_MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", zIndex: 1002 }}>
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
      <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "#0a0a0e" }}>
        {photos.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: "3rem", color: "rgba(255,255,255,0.06)", letterSpacing: "0.05em" }}>
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
          background: "linear-gradient(to top, rgba(5,5,8,0.7) 0%, transparent 50%)",
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
                  borderRadius: "2px",
                  background: i === idx ? BLUE : "rgba(255,255,255,0.35)",
                  transition: "width 0.3s ease, background 0.3s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: "0.9rem 1.1rem 1.1rem" }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: "1.4rem", color: "#fff", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>
          {album.name.toUpperCase()}
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>
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
    <div style={{ background: "#050508", minHeight: "100vh" }}>
      <style>{GRID_STYLES}</style>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "8rem 2.5rem 3rem" }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(3rem, 8vw, 6rem)", color: "#fff", letterSpacing: "0.04em", lineHeight: 1, marginBottom: "0.6rem" }}>
          PHOTOGRAPHY
        </h1>
        <div style={{ width: "3.5rem", height: "2px", background: BLUE, marginBottom: "1.25rem" }} />
        <p style={{ fontFamily: FONT_MONO, fontSize: "0.75rem", color: "rgba(255,255,255,0.38)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "3rem" }}>
          Street · Architecture · Light
        </p>

        {error && <p style={{ color: "#ef4444", fontFamily: FONT_MONO, fontSize: "0.72rem" }}>{error}</p>}
        {loading && <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: FONT_MONO, fontSize: "0.72rem", letterSpacing: "0.08em" }}>Loading...</p>}

        <div className="albums-grid">
          {albums.map(album => (
            <AlbumCard key={album.id} album={album} onClick={() => onSelect(album.slug)} />
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "0 2.5rem 3rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "2rem" }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.22)", letterSpacing: "0.06em", lineHeight: "1.8" }}>
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
    <div style={{ background: "#050508", minHeight: "100vh" }}>
      <style>{GRID_STYLES}</style>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "8rem 2.5rem 3rem" }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", color: BLUE, fontFamily: FONT_MONO, fontSize: "0.68rem", letterSpacing: "0.1em", cursor: "pointer", padding: 0, marginBottom: "2.5rem", display: "block" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = BLUE)}
        >
          ← ALL ALBUMS
        </button>

        {error && <p style={{ color: "#ef4444", fontFamily: FONT_MONO, fontSize: "0.72rem" }}>{error}</p>}
        {loading && <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: FONT_MONO, fontSize: "0.72rem", letterSpacing: "0.08em" }}>Loading...</p>}

        {album && (
          <>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(3rem, 8vw, 6rem)", color: "#fff", letterSpacing: "0.04em", lineHeight: 1, marginBottom: "0.6rem" }}>
              {album.name.toUpperCase()}
            </h1>
            <div style={{ width: "3.5rem", height: "2px", background: BLUE, marginBottom: "2.5rem" }} />

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

      <div style={{ textAlign: "center", padding: "0 2.5rem 3rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "2rem" }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.22)", letterSpacing: "0.06em", lineHeight: "1.8" }}>
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
