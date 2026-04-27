import { useState, useEffect, useRef, useCallback } from "react";

const BLUE = "#3b82f6";
const BG = "#050508";
const FONT_DISPLAY = "'Bebas Neue', sans-serif";
const FONT_MONO = "'Space Mono', monospace";

interface Album {
  id: number;
  name: string;
  slug: string;
  photo_count: number;
}

interface Photo {
  id: number;
  filename: string;
  display_order: number;
}

async function resizeImage(file: File, maxPx = 2000): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))), "image/jpeg", 0.85);
    };
    img.onerror = reject;
    img.src = url;
  });
}

const ADMIN_STYLES = `
  .admin-sidebar::-webkit-scrollbar { width: 4px; }
  .admin-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  .admin-main::-webkit-scrollbar { width: 4px; }
  .admin-main::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  .photo-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  @media (max-width: 900px) {
    .photo-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

export default function AdminPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showNewAlbum, setShowNewAlbum] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAlbums = useCallback(async () => {
    try {
      const res = await fetch("/api/albums");
      if (!res.ok) throw new Error(await res.text());
      setAlbums(await res.json());
    } catch (e: unknown) {
      setError(String(e));
    }
  }, []);

  const fetchPhotos = useCallback(async (album: Album) => {
    try {
      const res = await fetch(`/api/albums/${album.slug}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPhotos(data.photos);
    } catch (e: unknown) {
      setError(String(e));
    }
  }, []);

  useEffect(() => { fetchAlbums(); }, [fetchAlbums]);

  async function selectAlbum(album: Album) {
    setSelectedAlbum(album);
    setError("");
    await fetchPhotos(album);
  }

  async function createAlbum() {
    if (!newName.trim() || !newSlug.trim()) return;
    try {
      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), slug: newSlug.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      setNewName(""); setNewSlug(""); setShowNewAlbum(false);
      await fetchAlbums();
    } catch (e: unknown) {
      setError(String(e));
    }
  }

  async function deleteAlbum(album: Album) {
    if (!window.confirm(`Delete album "${album.name}" and all its photos?`)) return;
    try {
      const res = await fetch(`/api/albums/${album.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      if (selectedAlbum?.id === album.id) { setSelectedAlbum(null); setPhotos([]); }
      await fetchAlbums();
    } catch (e: unknown) {
      setError(String(e));
    }
  }

  async function handleFiles(fileList: FileList) {
    if (!selectedAlbum) return;
    const files = Array.from(fileList);
    let done = 0;
    setUploadStatus(`Uploading 0/${files.length}...`);
    for (const file of files) {
      try {
        const resized = await resizeImage(file);
        const form = new FormData();
        form.append("album_id", String(selectedAlbum.id));
        form.append("filename", file.name.replace(/[^a-zA-Z0-9._-]/g, "_"));
        form.append("file", resized, file.name);
        const res = await fetch("/api/photos/upload", { method: "POST", body: form });
        if (!res.ok) throw new Error(await res.text());
        done++;
        setUploadStatus(`Uploading ${done}/${files.length}...`);
      } catch (e: unknown) {
        setError(String(e));
      }
    }
    setUploadStatus("");
    const updated = { ...selectedAlbum, photo_count: selectedAlbum.photo_count + done };
    setSelectedAlbum(updated);
    await fetchPhotos(updated);
    await fetchAlbums();
  }

  async function deletePhoto(photo: Photo) {
    if (!window.confirm("Delete this photo?")) return;
    try {
      const res = await fetch(`/api/photos/${photo.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      if (selectedAlbum) {
        const updated = { ...selectedAlbum, photo_count: selectedAlbum.photo_count - 1 };
        setSelectedAlbum(updated);
        await fetchPhotos(updated);
        await fetchAlbums();
      }
    } catch (e: unknown) {
      setError(String(e));
    }
  }

  async function patchOrder(photo: Photo, newOrder: number) {
    try {
      const res = await fetch(`/api/photos/${photo.id}/order`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_order: newOrder }),
      });
      if (!res.ok) throw new Error(await res.text());
      if (selectedAlbum) await fetchPhotos(selectedAlbum);
    } catch (e: unknown) {
      setError(String(e));
    }
  }

  const inputBase: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "2px",
    color: "#fff",
    fontFamily: FONT_MONO,
    fontSize: "0.72rem",
    padding: "0.45rem 0.6rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: FONT_MONO }}>
      <style>{ADMIN_STYLES}</style>

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", height: "3.5rem",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: "2rem", color: BLUE, letterSpacing: "0.05em" }}>
          ADMIN
        </span>
        <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.68rem", letterSpacing: "0.1em", textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
          ← EXIT
        </a>
      </div>

      {/* Error bar */}
      {error && (
        <div style={{ background: "#7f1d1d", color: "#fca5a5", fontFamily: FONT_MONO, fontSize: "0.68rem", padding: "0.5rem 2rem", letterSpacing: "0.06em" }}>
          {error}{" "}
          <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#fca5a5", cursor: "pointer", fontSize: "1rem" }}>×</button>
        </div>
      )}

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar */}
        <div className="admin-sidebar" style={{
          width: "280px", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.07)",
          overflowY: "auto", display: "flex", flexDirection: "column",
        }}>
          <div style={{ padding: "1rem 1.25rem 0.5rem", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Albums
          </div>
          {albums.map(album => (
            <div
              key={album.id}
              onClick={() => selectAlbum(album)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.7rem 1.25rem",
                borderLeft: selectedAlbum?.id === album.id ? `3px solid ${BLUE}` : "3px solid transparent",
                background: selectedAlbum?.id === album.id ? "rgba(59,130,246,0.07)" : "transparent",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (selectedAlbum?.id !== album.id) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={e => { if (selectedAlbum?.id !== album.id) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
            >
              <div>
                <div style={{ fontSize: "0.75rem", color: "#fff", letterSpacing: "0.04em" }}>{album.name}</div>
                <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", marginTop: "0.2rem" }}>{album.photo_count} photos</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); deleteAlbum(album); }}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: "1.1rem", lineHeight: 1, padding: "0.25rem" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
              >
                ×
              </button>
            </div>
          ))}

          {/* New album */}
          <div style={{ padding: "1rem 1.25rem", marginTop: "auto" }}>
            {showNewAlbum ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <input
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }}
                  placeholder="Album name"
                  style={inputBase}
                />
                <input
                  value={newSlug}
                  onChange={e => setNewSlug(e.target.value)}
                  placeholder="slug"
                  style={inputBase}
                />
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={createAlbum} style={{ flex: 1, background: BLUE, border: "none", color: "#fff", fontFamily: FONT_MONO, fontSize: "0.65rem", padding: "0.45rem", borderRadius: "2px", cursor: "pointer", letterSpacing: "0.06em" }}>
                    CREATE
                  </button>
                  <button onClick={() => { setShowNewAlbum(false); setNewName(""); setNewSlug(""); }} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", color: "rgba(255,255,255,0.6)", fontFamily: FONT_MONO, fontSize: "0.65rem", padding: "0.45rem", borderRadius: "2px", cursor: "pointer" }}>
                    CANCEL
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewAlbum(true)}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.08em", padding: "0.55rem", borderRadius: "2px", cursor: "pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BLUE; (e.currentTarget as HTMLButtonElement).style.color = BLUE; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)"; }}
              >
                + NEW ALBUM
              </button>
            )}
          </div>
        </div>

        {/* Main area */}
        <div className="admin-main" style={{ flex: 1, overflowY: "auto", padding: "2rem 2.5rem" }}>
          {!selectedAlbum ? (
            <div style={{ color: "rgba(255,255,255,0.2)", fontFamily: FONT_MONO, fontSize: "0.72rem", letterSpacing: "0.08em", marginTop: "3rem", textAlign: "center" }}>
              Select an album to get started
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "2.5rem", color: "#fff", letterSpacing: "0.04em", lineHeight: 1, marginBottom: "0.3rem" }}>
                  {selectedAlbum.name}
                </h1>
                <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>
                  {photos.length} photos
                </div>
              </div>

              {/* Upload zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? BLUE : "rgba(255,255,255,0.12)"}`,
                  borderRadius: "4px",
                  padding: "2rem",
                  textAlign: "center",
                  cursor: "pointer",
                  marginBottom: "2rem",
                  transition: "border-color 0.2s",
                  background: dragOver ? "rgba(59,130,246,0.05)" : "transparent",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={e => { if (e.target.files) handleFiles(e.target.files); e.target.value = ""; }}
                />
                {uploadStatus ? (
                  <span style={{ color: BLUE, fontSize: "0.72rem", letterSpacing: "0.08em" }}>{uploadStatus}</span>
                ) : (
                  <>
                    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
                      Drop images here or click to upload
                    </div>
                    <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>
                      Resized to max 2000px, JPEG 0.85
                    </div>
                  </>
                )}
              </div>

              {/* Photo grid */}
              <div className="photo-grid">
                {photos.map(photo => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    albumId={selectedAlbum.id}
                    onDelete={deletePhoto}
                    onOrder={patchOrder}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PhotoCard({
  photo,
  albumId,
  onDelete,
  onOrder,
}: {
  photo: Photo;
  albumId: number;
  onDelete: (p: Photo) => void;
  onOrder: (p: Photo, order: number) => void;
}) {
  const [order, setOrder] = useState(String(photo.display_order));

  useEffect(() => { setOrder(String(photo.display_order)); }, [photo.display_order]);

  return (
    <div style={{ position: "relative", background: "rgba(255,255,255,0.03)", borderRadius: "2px", overflow: "hidden" }}>
      <img
        src={`/api/photos/album-${albumId}/${photo.filename}`}
        alt=""
        loading="lazy"
        style={{ display: "block", width: "100%", aspectRatio: "1", objectFit: "cover" }}
      />
      <div style={{ padding: "0.4rem 0.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem" }}>
        <input
          value={order}
          onChange={e => setOrder(e.target.value)}
          onBlur={() => {
            const n = parseInt(order, 10);
            if (!isNaN(n) && n !== photo.display_order) onOrder(photo, n);
          }}
          style={{
            width: "3rem",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "2px",
            color: "rgba(255,255,255,0.6)",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.6rem",
            padding: "0.2rem 0.3rem",
            outline: "none",
            textAlign: "center",
          }}
        />
        <button
          onClick={() => onDelete(photo)}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: "0.2rem" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >
          ×
        </button>
      </div>
    </div>
  );
}
