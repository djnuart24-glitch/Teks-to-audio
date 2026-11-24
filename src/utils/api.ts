/**
 * Safe fetch utility that prevents Safari / WebKit DOMException:
 * "The string did not match the expected pattern."
 * when the server returns HTML (e.g. 404, 502, Vercel SPA routing) instead of JSON.
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type') || '';
    const rawText = await response.text();

    if (!rawText.trim()) {
      return {
        ok: false,
        status: response.status,
        error: `Server mengembalikan respons kosong (Status: ${response.status}).`,
      };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Check if server returned an HTML error page or fallback SPA index.html
      if (rawText.includes('<!DOCTYPE') || rawText.includes('<html') || rawText.includes('<body')) {
        return {
          ok: false,
          status: response.status,
          error: `Endpoint ${url} tidak merespons dalam format JSON (menerima halaman HTML status ${response.status}). Pastikan backend server API telah aktif.`,
        };
      }
      return {
        ok: false,
        status: response.status,
        error: `Gagal membaca format JSON: ${rawText.slice(0, 120)}`,
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        data: parsed,
        error: parsed?.error || `Permintaan gagal dengan status ${response.status}.`,
      };
    }

    return {
      ok: true,
      status: response.status,
      data: parsed,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error:
        err?.message === 'The string did not match the expected pattern.'
          ? 'Format respons server tidak sesuai dengan pola JSON yang diharapkan. Silakan periksa koneksi atau coba kembali.'
          : err?.message || 'Terjadi gangguan jaringan saat menghubungi server.',
    };
  }
}

/**
 * Converts a base64 audio string to a Blob URL.
 * Prevents Safari / iOS length restrictions on data: URIs and malformed pattern errors.
 */
export function base64ToBlobUrl(base64: string, mimeType = 'audio/wav'): string {
  try {
    // Remove all whitespace or newlines from base64
    const cleanBase64 = base64.replace(/\s+/g, '');
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteNumbers], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.warn('Error converting base64 to Blob URL, fallback to data URI:', e);
    return `data:${mimeType};base64,${base64}`;
  }
}
