// src/hooks/useReportHistory.ts
export interface SavedReport {
  id: string;
  savedAt: string;
  companyName: string;
  projectName: string;
  areaName: string;
  reportDate: string;
  phone: string;
  email: string;
  address: string;
  photoCount: number;
  photos: { id: string; url: string }[];
}

const STORAGE_KEY = 'dibersa_report_history';

async function urlToBase64(url: string): Promise<string> {
  if (url.startsWith('data:') || !url.startsWith('blob:')) return url;
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function useReportHistory() {
  async function saveReport(
    report: Omit<SavedReport, 'id' | 'savedAt' | 'photoCount'>
  ): Promise<SavedReport> {
    const persistedPhotos = await Promise.all(
      report.photos.map(async (photo) => ({
        id: photo.id,
        url: await urlToBase64(photo.url),
      }))
    );
    const savedReport: SavedReport = {
      ...report,
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      photoCount: persistedPhotos.length,
      photos: persistedPhotos,
    };
    const existing = getReports();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([savedReport, ...existing]));
    return savedReport;
  }

  function getReports(): SavedReport[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SavedReport[]) : [];
    } catch {
      return [];
    }
  }

  function deleteReport(id: string): void {
    const updated = getReports().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  return { saveReport, getReports, deleteReport };
}