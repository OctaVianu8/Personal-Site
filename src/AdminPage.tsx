import { useCallback, useEffect, useRef, useState } from "react";
import ContentEditor from "./content/ContentEditor";
import styles from "./AdminPage.module.css";

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

interface CvFile {
  id: number;
  original_filename: string;
  size_bytes: number;
  uploaded_at: string;
  is_active: number;
}

type AdminSection = "cv" | "photos" | "content";
type IconProps = { className?: string };

const EditIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DocumentIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6M8 13h8M8 17h6" />
  </svg>
);

const PhotographyIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.5 4 16 7h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4l1.5-3Z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

const UploadIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
  </svg>
);

const ExternalIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

const LinkIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
  </svg>
);

const CheckIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12 4 4L19 6" />
  </svg>
);

const TrashIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" />
  </svg>
);

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
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not resize image.")), "image/jpeg", 0.85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read ${file.name}.`));
    };
    img.src = url;
  });
}

async function getResponseError(response: Response): Promise<string> {
  try {
    const body = await response.json() as { error?: string };
    return body.error ?? `Request failed (${response.status}).`;
  } catch {
    return `Request failed (${response.status}).`;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string): string {
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AdminPage() {
  const [section, setSection] = useState<AdminSection>("cv");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [cvFiles, setCvFiles] = useState<CvFile[]>([]);
  const [cvLoading, setCvLoading] = useState(true);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvDragOver, setCvDragOver] = useState(false);
  const [cvChangingId, setCvChangingId] = useState<number | null>(null);
  const [photoDragOver, setPhotoDragOver] = useState(false);
  const [photoUploadStatus, setPhotoUploadStatus] = useState("");
  const [showNewAlbum, setShowNewAlbum] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const cvInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const fetchCvs = useCallback(async () => {
    setCvLoading(true);
    try {
      const response = await fetch("/api/cvs");
      if (!response.ok) throw new Error(await getResponseError(response));
      setCvFiles(await response.json() as CvFile[]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setCvLoading(false);
    }
  }, []);

  const fetchAlbums = useCallback(async () => {
    try {
      const response = await fetch("/api/albums");
      if (!response.ok) throw new Error(await getResponseError(response));
      setAlbums(await response.json() as Album[]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }, []);

  const fetchPhotos = useCallback(async (album: Album) => {
    try {
      const response = await fetch(`/api/albums/${album.slug}`);
      if (!response.ok) throw new Error(await getResponseError(response));
      const data = await response.json() as { photos: Photo[] };
      setPhotos(data.photos);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }, []);

  useEffect(() => {
    void fetchCvs();
    void fetchAlbums();
  }, [fetchAlbums, fetchCvs]);

  const activeCv = cvFiles.find((cv) => Boolean(cv.is_active)) ?? null;

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  async function uploadCv(file: File) {
    const looksLikePdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!looksLikePdf) {
      setError("Please choose a PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("The PDF must be smaller than 10 MB.");
      return;
    }

    setCvUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file, file.name);
      const response = await fetch("/api/cvs/upload", { method: "POST", body: form });
      if (!response.ok) throw new Error(await getResponseError(response));
      await fetchCvs();
      showNotice("CV uploaded and published.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setCvUploading(false);
    }
  }

  async function activateCv(cv: CvFile) {
    setCvChangingId(cv.id);
    setError("");
    try {
      const response = await fetch(`/api/cvs/${cv.id}/activate`, { method: "PATCH" });
      if (!response.ok) throw new Error(await getResponseError(response));
      await fetchCvs();
      showNotice(`${cv.original_filename} is now live.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setCvChangingId(null);
    }
  }

  async function deleteCv(cv: CvFile) {
    if (!window.confirm(`Delete “${cv.original_filename}”? This cannot be undone.`)) return;
    setCvChangingId(cv.id);
    setError("");
    try {
      const response = await fetch(`/api/cvs/${cv.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await getResponseError(response));
      await fetchCvs();
      showNotice("CV version deleted.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setCvChangingId(null);
    }
  }

  async function copyPublicLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/CV.pdf`);
      showNotice("Public CV link copied.");
    } catch {
      setError("Could not copy the link. Open the public CV and copy its address instead.");
    }
  }

  async function selectAlbum(album: Album) {
    setSection("photos");
    setSelectedAlbum(album);
    setError("");
    await fetchPhotos(album);
  }

  async function createAlbum() {
    if (!newName.trim() || !newSlug.trim()) return;
    setError("");
    try {
      const response = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), slug: newSlug.trim() }),
      });
      if (!response.ok) throw new Error(await getResponseError(response));
      const album = await response.json() as Album;
      setNewName("");
      setNewSlug("");
      setShowNewAlbum(false);
      await fetchAlbums();
      await selectAlbum({ ...album, photo_count: 0 });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }

  async function deleteAlbum(album: Album) {
    if (!window.confirm(`Delete “${album.name}” and all of its photos?`)) return;
    try {
      const response = await fetch(`/api/albums/${album.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await getResponseError(response));
      if (selectedAlbum?.id === album.id) {
        setSelectedAlbum(null);
        setPhotos([]);
      }
      await fetchAlbums();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }

  async function uploadPhotos(fileList: FileList) {
    if (!selectedAlbum) return;
    const files = Array.from(fileList);
    let completed = 0;
    setPhotoUploadStatus(`Uploading 0/${files.length}`);
    setError("");

    for (const file of files) {
      try {
        const resized = await resizeImage(file);
        const form = new FormData();
        form.append("album_id", String(selectedAlbum.id));
        form.append("filename", file.name.replace(/[^a-zA-Z0-9._-]/g, "_"));
        form.append("file", resized, file.name);
        const response = await fetch("/api/photos/upload", { method: "POST", body: form });
        if (!response.ok) throw new Error(await getResponseError(response));
        completed += 1;
        setPhotoUploadStatus(`Uploading ${completed}/${files.length}`);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : String(caught));
      }
    }

    setPhotoUploadStatus("");
    const updated = { ...selectedAlbum, photo_count: selectedAlbum.photo_count + completed };
    setSelectedAlbum(updated);
    await Promise.all([fetchPhotos(updated), fetchAlbums()]);
    if (completed > 0) showNotice(`${completed} photo${completed === 1 ? "" : "s"} uploaded.`);
  }

  async function deletePhoto(photo: Photo) {
    if (!window.confirm("Delete this photo?")) return;
    try {
      const response = await fetch(`/api/photos/${photo.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await getResponseError(response));
      if (selectedAlbum) {
        const updated = { ...selectedAlbum, photo_count: Math.max(0, selectedAlbum.photo_count - 1) };
        setSelectedAlbum(updated);
        await Promise.all([fetchPhotos(updated), fetchAlbums()]);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }

  async function patchPhotoOrder(photo: Photo, displayOrder: number) {
    try {
      const response = await fetch(`/api/photos/${photo.id}/order`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_order: displayOrder }),
      });
      if (!response.ok) throw new Error(await getResponseError(response));
      if (selectedAlbum) await fetchPhotos(selectedAlbum);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <a className={styles.brand} href="/" aria-label="Back to website">
          <span className={styles.brandMark}>OS</span>
          <span>
            <strong>Content desk</strong>
            <small>Octavian Stănescu</small>
          </span>
        </a>
        <div className={styles.topbarActions}>
          <span className={styles.savedState}><span /> Changes publish instantly</span>
          <a className={styles.exitLink} href="/">Exit admin <span>↗</span></a>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarGroup}>
            <p className={styles.sidebarLabel}>Content</p>
            <button
              className={`${styles.navItem} ${section === "content" ? styles.navItemActive : ""}`}
              type="button"
              onClick={() => setSection("content")}
            >
              <EditIcon className={styles.navIcon} />
              <span>Site text</span>
            </button>
            <button
              className={`${styles.navItem} ${section === "cv" ? styles.navItemActive : ""}`}
              type="button"
              onClick={() => setSection("cv")}
            >
              <DocumentIcon className={styles.navIcon} />
              <span>CV manager</span>
              {activeCv && <span className={styles.liveDot} aria-label="CV published" />}
            </button>
            <button
              className={`${styles.navItem} ${section === "photos" ? styles.navItemActive : ""}`}
              type="button"
              onClick={() => setSection("photos")}
            >
              <PhotographyIcon className={styles.navIcon} />
              <span>Photography</span>
              <span className={styles.navCount}>{albums.length}</span>
            </button>
          </div>

          {section === "photos" && (
            <div className={styles.albumSection}>
              <div className={styles.albumHeader}>
                <p className={styles.sidebarLabel}>Albums</p>
                <button type="button" onClick={() => setShowNewAlbum(true)} aria-label="Create album">+</button>
              </div>
              <div className={styles.albumList}>
                {albums.map((album) => (
                  <div className={`${styles.albumItem} ${selectedAlbum?.id === album.id ? styles.albumItemActive : ""}`} key={album.id}>
                    <button className={styles.albumSelect} type="button" onClick={() => void selectAlbum(album)}>
                      <span>{album.name}</span>
                      <small>{album.photo_count} photos</small>
                    </button>
                    <button className={styles.deleteAlbum} type="button" onClick={() => void deleteAlbum(album)} aria-label={`Delete ${album.name}`}>×</button>
                  </div>
                ))}
              </div>

              {showNewAlbum && (
                <div className={styles.newAlbumForm}>
                  <input
                    value={newName}
                    onChange={(event) => {
                      setNewName(event.target.value);
                      setNewSlug(event.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                    }}
                    placeholder="Album name"
                    autoFocus
                  />
                  <input value={newSlug} onChange={(event) => setNewSlug(event.target.value)} placeholder="url-slug" />
                  <div>
                    <button type="button" className={styles.smallPrimary} onClick={() => void createAlbum()}>Create</button>
                    <button type="button" className={styles.smallGhost} onClick={() => setShowNewAlbum(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={styles.storageNote}>
            <span className={styles.storageIcon}>R2</span>
            <span><strong>Cloud storage</strong><small>Files stay outside the frontend</small></span>
          </div>
        </aside>

        <main className={styles.main}>
          {error && (
            <div className={styles.errorBanner} role="alert">
              <span>{error}</span>
              <button type="button" onClick={() => setError("")} aria-label="Dismiss error">×</button>
            </div>
          )}
          {notice && <div className={styles.notice} role="status"><CheckIcon /> {notice}</div>}

          {section === "content" ? (
            <section className={styles.contentSection}>
              <div className={styles.pageHeading}>
                <div>
                  <p className={styles.eyebrow}>Site Management</p>
                  <h1>Site text</h1>
                  <p>Edit hero highlights, bio paragraphs, experience timeline, awards, and contact links directly.</p>
                </div>
              </div>
              <ContentEditor onNotice={showNotice} onError={setError} />
            </section>
          ) : section === "cv" ? (
            <section className={styles.contentSection}>
              <div className={styles.pageHeading}>
                <div>
                  <p className={styles.eyebrow}>Public document</p>
                  <h1>CV manager</h1>
                  <p>Upload a new version or bring an earlier one back. Your public link never changes.</p>
                </div>
                <a className={styles.secondaryButton} href="/CV.pdf" target="_blank" rel="noreferrer">
                  <ExternalIcon /> View public CV
                </a>
              </div>

              <div className={styles.cvOverview}>
                <article className={styles.liveCard}>
                  <div className={styles.cardTopline}>
                    <span className={styles.cardLabel}>Live on your website</span>
                    {activeCv && <span className={styles.liveBadge}><span /> Published</span>}
                  </div>
                  {cvLoading ? (
                    <div className={styles.cardSkeleton} />
                  ) : activeCv ? (
                    <div className={styles.liveDocument}>
                      <div className={styles.documentTile}><DocumentIcon /><span>PDF</span></div>
                      <div className={styles.liveDetails}>
                        <h2>{activeCv.original_filename}</h2>
                        <p>{formatBytes(activeCv.size_bytes)} · Uploaded {formatDate(activeCv.uploaded_at)}</p>
                        <div className={styles.liveActions}>
                          <a href="/CV.pdf" target="_blank" rel="noreferrer">Open file <ExternalIcon /></a>
                          <button type="button" onClick={() => void copyPublicLink()}><LinkIcon /> Copy link</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.emptyLive}>
                      <DocumentIcon />
                      <div><h2>No CV published</h2><p>Upload your first PDF to make `/CV.pdf` available.</p></div>
                    </div>
                  )}
                </article>

                <div
                  className={`${styles.cvDropzone} ${cvDragOver ? styles.dropzoneActive : ""}`}
                  onDragOver={(event) => { event.preventDefault(); setCvDragOver(true); }}
                  onDragLeave={() => setCvDragOver(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setCvDragOver(false);
                    const file = event.dataTransfer.files[0];
                    if (file) void uploadCv(file);
                  }}
                  onClick={() => !cvUploading && cvInputRef.current?.click()}
                  onKeyDown={(event) => {
                    if ((event.key === "Enter" || event.key === " ") && !cvUploading) cvInputRef.current?.click();
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload a new CV"
                >
                  <input
                    ref={cvInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadCv(file);
                      event.target.value = "";
                    }}
                  />
                  <span className={styles.uploadIconWrap}><UploadIcon /></span>
                  <strong>{cvUploading ? "Publishing your CV…" : "Upload a new version"}</strong>
                  <p>{cvUploading ? "This can take a moment." : "Drop a PDF here, or click to browse."}</p>
                  <small>PDF only · 10 MB maximum · published immediately</small>
                  {cvUploading && <span className={styles.progressBar}><i /></span>}
                </div>
              </div>

              <section className={styles.versionsPanel}>
                <div className={styles.panelHeading}>
                  <div><h2>Recent versions</h2><p>Your latest uploads, with the live version pinned first.</p></div>
                  <span>{cvFiles.length} stored</span>
                </div>

                {cvLoading ? (
                  <div className={styles.loadingRows}><span /><span /><span /></div>
                ) : cvFiles.length === 0 ? (
                  <div className={styles.emptyVersions}>Your uploaded CVs will appear here.</div>
                ) : (
                  <div className={styles.versionList}>
                    {cvFiles.map((cv) => {
                      const active = Boolean(cv.is_active);
                      const changing = cvChangingId === cv.id;
                      return (
                        <article className={`${styles.versionRow} ${active ? styles.versionRowActive : ""}`} key={cv.id}>
                          <div className={styles.versionIcon}><DocumentIcon /></div>
                          <div className={styles.versionInfo}>
                            <div><strong>{cv.original_filename}</strong>{active && <span>Live</span>}</div>
                            <p>{formatDate(cv.uploaded_at)} <i /> {formatBytes(cv.size_bytes)}</p>
                          </div>
                          <div className={styles.versionActions}>
                            <a href={`/api/cvs/${cv.id}/file`} target="_blank" rel="noreferrer" aria-label={`Preview ${cv.original_filename}`}>Preview</a>
                            {active ? (
                              <span className={styles.activeSelection}><CheckIcon /> Selected</span>
                            ) : (
                              <button type="button" disabled={changing} onClick={() => void activateCv(cv)}>
                                {changing ? "Selecting…" : "Use this version"}
                              </button>
                            )}
                            <button
                              className={styles.trashButton}
                              type="button"
                              disabled={active || changing}
                              onClick={() => void deleteCv(cv)}
                              aria-label={active ? "The live version cannot be deleted" : `Delete ${cv.original_filename}`}
                              title={active ? "Select another version before deleting this one" : "Delete version"}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </section>
          ) : (
            <section className={styles.contentSection}>
              <div className={styles.pageHeading}>
                <div>
                  <p className={styles.eyebrow}>Photography</p>
                  <h1>{selectedAlbum?.name ?? "Photo library"}</h1>
                  <p>{selectedAlbum ? `${photos.length} photos in this album.` : "Choose an album from the sidebar or create a new one."}</p>
                </div>
              </div>

              {!selectedAlbum ? (
                <div className={styles.photoEmpty}>
                  <PhotographyIcon />
                  <h2>Select an album</h2>
                  <p>Your albums and upload controls are available in the sidebar.</p>
                  <button type="button" className={styles.primaryButton} onClick={() => setShowNewAlbum(true)}>Create an album</button>
                </div>
              ) : (
                <>
                  <div
                    className={`${styles.photoDropzone} ${photoDragOver ? styles.dropzoneActive : ""}`}
                    onDragOver={(event) => { event.preventDefault(); setPhotoDragOver(true); }}
                    onDragLeave={() => setPhotoDragOver(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setPhotoDragOver(false);
                      void uploadPhotos(event.dataTransfer.files);
                    }}
                    onClick={() => photoInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") photoInputRef.current?.click();
                    }}
                  >
                    <input
                      ref={photoInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      hidden
                      onChange={(event) => {
                        if (event.target.files) void uploadPhotos(event.target.files);
                        event.target.value = "";
                      }}
                    />
                    <UploadIcon />
                    <div><strong>{photoUploadStatus || "Add photos"}</strong><span>Drop images or click to browse · resized to 2000px</span></div>
                  </div>

                  <div className={styles.photoGrid}>
                    {photos.map((photo) => (
                      <PhotoCard
                        key={`${photo.id}-${photo.display_order}`}
                        photo={photo}
                        albumId={selectedAlbum.id}
                        onDelete={deletePhoto}
                        onOrder={patchPhotoOrder}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>
          )}
        </main>
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
  onDelete: (photo: Photo) => void;
  onOrder: (photo: Photo, order: number) => void;
}) {
  const [order, setOrder] = useState(String(photo.display_order));

  return (
    <article className={styles.photoCard}>
      <img src={`/api/photos/album-${albumId}/${photo.filename}`} alt="" loading="lazy" />
      <div>
        <label>
          <span>Order</span>
          <input
            value={order}
            inputMode="numeric"
            onChange={(event) => setOrder(event.target.value)}
            onBlur={() => {
              const value = Number.parseInt(order, 10);
              if (!Number.isNaN(value) && value !== photo.display_order) onOrder(photo, value);
            }}
          />
        </label>
        <button type="button" onClick={() => onDelete(photo)} aria-label="Delete photo"><TrashIcon /></button>
      </div>
    </article>
  );
}
