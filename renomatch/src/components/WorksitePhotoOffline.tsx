import { useEffect, useRef, useState } from "react";
import {
  addPendingPhoto,
  listPendingPhotos,
  type PendingPhoto,
  syncPendingPhotos,
} from "../services/offlinePhotoStore";

type Props = {
  orderId: string;
};

async function uploadPhotoToApi(photo: PendingPhoto): Promise<void> {
  // API potentiellement indisponible: acceptable pour ce POC
  const formData = new FormData();
  formData.append("photo", photo.blob, `worksite_${photo.id}.jpg`);
  formData.append("capturedAt", new Date(photo.createdAt).toISOString());

  const response = await fetch(`/api/worksites/${photo.orderId}/photos`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }
}

export default function WorksitePhotoOffline({ orderId }: Props) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadPhotos = async () => {
    const next = await listPendingPhotos(orderId);
    setPendingPhotos((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      return next;
    });
  };

  useEffect(() => {
    void loadPhotos();

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (!isOnline) return;
    void handleSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const onPickPhotoClick = () => {
    // toujours cliquable, même hors ligne
    fileInputRef.current?.click();
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await addPendingPhoto(orderId, file);
    e.target.value = "";
    await loadPhotos();
  };

  const handleSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    await syncPendingPhotos(orderId, uploadPhotoToApi);
    await loadPhotos();
    setIsSyncing(false);
  };

  return (
    <section className="offline-photo-card">
      <h2>Photos de chantier</h2>

      <div className="status-row">
        <span className={`network-badge ${isOnline ? "online" : "offline"}`}>
          {isOnline ? "🟢 En ligne" : "☁️🚫 Hors ligne"}
        </span>
      </div>

      <button className="add-photo-btn" onClick={onPickPhotoClick}>
        Ajouter une photo
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileChange}
        style={{ display: "none" }}
      />

      <div className="sync-row">
        <button onClick={handleSync} disabled={!isOnline || isSyncing}>
          {isSyncing ? "Synchronisation..." : "Synchroniser"}
        </button>
      </div>

      <ul className="photo-list">
        {pendingPhotos.map((photo) => (
          <li key={photo.id} className="photo-item">
            <img src={photo.previewUrl} alt="Photo chantier en attente" />
            <span className="pending-chip" title="En attente de synchronisation">
              ☁️🚫 En attente de synchronisation
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}