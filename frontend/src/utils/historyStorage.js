// Photo history now lives entirely in the user's own browser
// (localStorage), never on the server. This is intentional: the app is
// meant to be used by many people, and results should only ever land on
// each person's own device - the server should not be a shared photo
// album that everyone's history is readable from.
//
// Trade-offs worth knowing:
// - History is per-browser, not per-account. Clearing browser data (or
//   switching devices/browsers) loses it. That's expected for this app.
// - localStorage has a small quota (usually ~5-10MB total). We store a
//   limited number of entries and prune the oldest ones automatically
//   if we ever hit the quota.

const STORAGE_KEY = "photobox:history";
const MAX_ITEMS = 20;

const readAll = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to read photo history:", error);
    return [];
  }
};

const writeAll = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    // Most likely a QuotaExceededError - drop the oldest half and retry
    // once before giving up, so one big image doesn't wipe everything.
    if (items.length > 1) {
      const trimmed = items.slice(0, Math.ceil(items.length / 2));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        return true;
      } catch (retryError) {
        console.error("Photo history storage is full, could not save:", retryError);
      }
    }
    return false;
  }
};

export const getHistory = () => readAll();

// entry: { filename, dataUrl, isQR }
export const addHistoryEntry = (entry) => {
  const items = readAll();
  const newEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    filename: entry.filename,
    dataUrl: entry.dataUrl,
    size: Math.round((entry.dataUrl.length * 3) / 4), // approx decoded byte size
    createdAt: new Date().toISOString(),
    isQR: !!entry.isQR,
  };

  const next = [newEntry, ...items].slice(0, MAX_ITEMS);
  writeAll(next);
  return newEntry;
};

export const deleteHistoryEntry = (id) => {
  const next = readAll().filter((item) => item.id !== id);
  writeAll(next);
  return next;
};

export const clearHistory = () => writeAll([]);

// Converts any fetchable image URL (server result, blob, etc.) into a
// data URL so it can be stored fully client-side.
export const urlToDataURL = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
