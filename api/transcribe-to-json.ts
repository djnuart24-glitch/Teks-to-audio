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
    const { audioBase64, mimeType = 'audio/webm', contextHint } = req.body || {};

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      res.status(400).json({ error: 'Data audio (base64) wajib disertakan.' });
      return;
    }

    if (!apiKey && !process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di server/Vercel.',
      });
      return;
    }

    const cleanMimeType = mimeType.split(';')[0].trim() || 'audio/webm';

    const systemPrompt = `Anda adalah asisten transkripsi audio multibahasa ahli (Bahasa Indonesia & Bahasa Arab).
Tugas Anda adalah mendengarkan audio rekaman, lalu menghasilkan transkripsi lengkap dan terperinci dalam format JSON terstruktur yang ketat.
Audio ini mengandung percakapan atau bacaan dalam bahasa Indonesia yang memiliki unsur atau istilah bahasa Arab (misalnya salam, doa, kutipan ayat/hadits, istilah fiqih/akhlak, sapaan akhi/ukhti, dll.).

Format JSON yang dihasilkan HARUS mengikuti struktur berikut:
{
  "metadata": {
    "title": "Judul singkat isi rekaman",
    "detected_languages": ["id", "ar"],
    "primary_language": "Bahasa Indonesia dengan unsur Arab",
    "estimated_tone": "e.g. Santun, Tausiyah, Doa, Percakapan Kasual, Khutbah",
    "arabic_presence_level": "Rendah | Sedang | Tinggi"
  },
  "summary": "Ringkasan padat dan jelas mengenai apa yang dibicarakan dalam rekaman suara ini.",
  "full_transcript": "Teks lengkap transkripsi kata demi kata persis seperti yang diucapkan, dengan ejaan baku bahasa Indonesia dan transliterasi istilah Arab yang tepat.",
  "segments": [
    {
      "id": 1,
      "time_range": "00:00 - 00:05",
      "speaker": "Pembicara 1",
      "text": "Teks pada penggalan waktu ini...",
      "language_tag": "id | ar | id-ar",
      "arabic_terms": ["istilah arab jika ada"],
      "sentiment": "Tenang | Khidmat | Bersemangat | Ramah"
    }
  ],
  "arabic_phrases_extracted": [
    {
      "phrase": "Istilah atau doa Arab yang diucapkan",
      "arabic_script": "Teks Arab asli (berharakat jika memungkinkan)",
      "transliteration": "Transliterasi latin (e.g. Assalamu'alaikum Warahmatullahi Wabarakatuh)",
      "indonesian_meaning": "Arti atau terjemahan dalam bahasa Indonesia",
      "category": "Salam | Doa | Dzikir | Ungkapan Sopan Santun | Istilah Agama"
    }
  ],
  "key_points": [
    "Poin penting 1 dari isi rekaman",
    "Poin penting 2"
  ],
  "glossary": [
    {
      "term": "Istilah Arab/Islam yang disebut",
      "meaning": "Penjelasan arti dan konteks penggunaannya"
    }
  ]
}

Pastikan:
1. Akurasi tinggi terhadap kata-kata bahasa Indonesia dan istilah Arab.
2. Jika ada lafaz Arab, tuliskan ejaan transliterasinya dengan rapi dan sertakan teks Arab aslinya.
3. Selalu kembalikan JSON murni.`;

    const userPrompt = contextHint
      ? `Transkripsikan audio ini menjadi JSON terstruktur lengkap. Konteks/catatan tambahan: ${contextHint}`
      : 'Transkripsikan audio ini secara lengkap dan akurat menjadi format JSON terstruktur.';

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: cleanMimeType,
                data: audioBase64,
              },
            },
            {
              text: userPrompt,
            },
          ],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const rawJson = response.text || '{}';
    let parsedData: any = {};

    try {
      const cleaned = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsedData = JSON.parse(cleaned);
    } catch {
      parsedData = {
        metadata: {
          title: 'Transkripsi Rekaman',
          detected_languages: ['id', 'ar'],
          primary_language: 'Bahasa Indonesia & Arab',
          estimated_tone: 'Religius / Santun',
          arabic_presence_level: 'Sedang',
        },
        summary: 'Transkripsi audio berhasil diproses.',
        full_transcript: rawJson,
        segments: [
          {
            id: 1,
            time_range: '00:00 - selesai',
            speaker: 'Pembicara',
            text: rawJson,
            language_tag: 'id-ar',
            arabic_terms: [],
            sentiment: 'Netral',
          },
        ],
        arabic_phrases_extracted: [],
        key_points: ['Hasil rekaman audio'],
        glossary: [],
      };
    }

    res.status(200).json({
      success: true,
      data: parsedData,
      rawResponse: rawJson,
    });
  } catch (error: any) {
    console.error('Error in transcribe handler:', error);
    let errorMsg = error?.message || 'Gagal mentranskripsi audio ke JSON.';
    try {
      if (typeof errorMsg === 'string' && errorMsg.trim().startsWith('{')) {
        const parsed = JSON.parse(errorMsg);
        if (parsed?.error?.message) {
          errorMsg = parsed.error.message;
        }
      }
    } catch {}

    if (errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE') || errorMsg.includes('high demand')) {
      errorMsg = 'Layanan AI sedang sibuk sementara (503). Silakan coba kirim audio kembali beberapa detik kemudian.';
    }

    res.status(500).json({
      error: errorMsg,
      details: error?.status || 'TRANSCRIPTION_ERROR',
    });
  }
}
