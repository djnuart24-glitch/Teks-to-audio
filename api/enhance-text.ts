import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  apiVersion: 'v1beta',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export default async function handler(req: Request | any, res: Response | any): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const { text, mode = 'tausiyah' } = req.body || {};

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Teks wajib diisi.' });
      return;
    }

    const modePrompts: Record<string, string> = {
      tausiyah: 'Ubah teks menjadi gaya tausiyah/nasihat bernuansa Islami yang hangat, santun, fasih dengan salam, doa singkat, dan tahmid.',
      doa: 'Ubah teks menjadi format doa harian yang menyentuh hati dalam bahasa Indonesia dengan lafaz Arab (bismillah, istighfar, doa memohon keberkahan).',
      percakapan: 'Ubah teks menjadi percakapan ramah sehari-hari khas santri/ikhwan/akhwat (menyisipkan afwan, jazakallahu khairan, barakallahu fiik, insyaAllah secara luwes).',
      sambutan: 'Ubah teks menjadi pembukaan pidato/sambutan formal islami (khutbatul hajah singkat, shalawat, dan salam penuh kehormatan).',
    };

    const instruction = modePrompts[mode] || modePrompts.tausiyah;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Teks sumber: "${text}"\n\nInstruksi: ${instruction}\nHasilkan hanya teks hasil modifikasi yang siap dibacakan, tanpa komentar pembuka atau penutup. Sertakan teks Arab atau istilah Arab yang relevan.`,
    });

    res.status(200).json({
      success: true,
      enhancedText: response.text?.trim() || text,
    });
  } catch (error: any) {
    console.error('Error in enhance handler:', error);
    let errorMsg = error?.message || 'Gagal memperkaya teks.';
    try {
      if (typeof errorMsg === 'string' && errorMsg.trim().startsWith('{')) {
        const parsed = JSON.parse(errorMsg);
        if (parsed?.error?.message) {
          errorMsg = parsed.error.message;
        }
      }
    } catch {}

    if (errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE') || errorMsg.includes('high demand')) {
      errorMsg = 'Layanan AI sedang sibuk sementara (503). Silakan coba klik sekali lagi beberapa detik kemudian.';
    }

    res.status(500).json({ error: errorMsg });
  }
}
