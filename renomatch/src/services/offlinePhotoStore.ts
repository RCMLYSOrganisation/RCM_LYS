export type PendingPhotoRecord = {
  id?: number;
  orderId: string;
  blob: Blob;
  createdAt: number;
};

export type PendingPhoto = PendingPhotoRecord & {
  id: number;
  previewUrl: string;
};

const DB_NAME = "renomatch-offline-db";
const DB_VERSION = 1;
const STORE_NAME = "worksite-photos";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("orderId", "orderId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addPendingPhoto(orderId: string, file: File): Promise<number> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const payload: PendingPhotoRecord = {
      orderId,
      blob: file,
      createdAt: Date.now(),
    };

    const req = store.add(payload);

    req.onsuccess = () => resolve(Number(req.result));
    req.onerror = () => reject(req.error);
  });
}

export async function listPendingPhotos(orderId: string): Promise<PendingPhoto[]> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("orderId");
    const req = index.getAll(orderId);

    req.onsuccess = () => {
      const rows = (req.result as PendingPhotoRecord[])
        .filter((r): r is PendingPhotoRecord & { id: number } => typeof r.id === "number")
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((r) => ({
          ...r,
          id: r.id!,
          previewUrl: URL.createObjectURL(r.blob),
        }));
      resolve(rows);
    };

    req.onerror = () => reject(req.error);
  });
}

export async function deletePendingPhoto(id: number): Promise<void> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function syncPendingPhotos(
  orderId: string,
  uploadFn: (p: PendingPhoto) => Promise<void>
): Promise<{ synced: number; failed: number }> {
  const photos = await listPendingPhotos(orderId);
  let synced = 0;
  let failed = 0;

  for (const photo of photos) {
    try {
      await uploadFn(photo);
      await deletePendingPhoto(photo.id);
      synced += 1;
    } catch {
      failed += 1;
    } finally {
      URL.revokeObjectURL(photo.previewUrl);
    }
  }

  return { synced, failed };
}