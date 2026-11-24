import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase payload limit for audio files (base64)
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ limit: '60mb', extended: true }));

// Initialize shared Gemini client
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

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Text-to-Speech (TTS) Endpoint
 * Generates audio in Indonesian with authentic Arabic phrasing & inflections
 */
app.post('/api/tts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, voice = 'Puck', style = 'Santun dan fasih', accentIntensity = 'moderate' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Teks tidak boleh kosong.' });
      return;
    }

    if (!apiKey) {
      res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di server. Pastikan API key telah aktif di Settings > Secrets.',
      });
      return;
    }

    // Build style and contextual prompt for Indonesian voice with Arabic nuances
    let intensityGuide = 'intonasi natural perpaduan bahasa Indonesia yang fasih dengan pengucapan istilah/doa Arab yang tepat makhrajnya';
    if (accentIntensity === 'strong') {
      intensityGuide = 'gaya tausiyah/khutbah atau ustadz yang fasih bertajwid, artikulasi makhraj Arab sangat jelas dan tartil';
    } else if (accentIntensity === 'light') {
      intensityGuide = 'bahasa Indonesia modern yang ramah dan luwes, dengan pelafalan istilah Arab yang lembut dan wajar';
    }

    const styleInstruction = `Gaya: ${style}. Karakter suara: ${intensityGuide}. Bacakan teks berbahasa Indonesia berikut dengan pelafalan istilah Arab/Islami yang benar dan fasih.`;

    // Available voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const chosenVoice = validVoices.includes(voice) ? voice : 'Puck';

    // Model selection: gemini-3.8-flash-lite-tts is the standard TTS model
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: styleInstruction,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    });

    const candidatePart = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = candidatePart?.inlineData?.data;

    if (!base64Audio) {
      res.status(502).json({
        error: 'Model tidak mengembalikan data audio. Silakan coba sesuaikan teks atau pilih suara lain.',
      });
      return;
    }

    res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: candidatePart?.inlineData?.mimeType || 'audio/wav',
      voice: chosenVoice,
      textLength: text.length,
    });
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    const errorMessage = error?.message || 'Terjadi kesalahan saat memproses text-to-speech.';
    res.status(500).json({
      error: errorMessage,
      details: error?.status || 'INTERNAL_ERROR',
    });
  }
});

/**
 * Audio to Structured JSON Transcription Endpoint
 * Transcribes audio (Indonesian + Arabic) into comprehensive JSON structure
 */
app.post('/api/transcribe-to-json', async (req: Request, res: Response): Promise<void> => {
  try {
    const { audioBase64, mimeType = 'audio/webm', contextHint } = req.body;

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      res.status(400).json({ error: 'Data audio (base64) wajib disertakan.' });
      return;
    }

    if (!apiKey) {
      res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi. Pastikan API key aktif di Settings > Secrets.',
      });
      return;
    }

    // Normalize mimeType (handling webm, wav, mp3, m4a, ogg, etc.)
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
2. Jika ada lafaz Arab (seperti bismillah, alhamdulillah, insyaallah, jazakallah, dll), tuliskan ejaan transliterasinya dengan rapi dan sertakan teks Arab aslinya di arabic_phrases_extracted.
3. Selalu kembalikan JSON murni tanpa markdown pembungkus.`;

    const userPrompt = contextHint
      ? `Transkripsikan audio ini menjadi JSON terstruktur lengkap. Konteks/catatan tambahan: ${contextHint}`
      : 'Transkripsikan audio ini secara lengkap dan akurat menjadi format JSON terstruktur.';

    // Use gemini-4-hydrogen for multimodal audio reasoning with structured JSON response
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
      // Clean possible fences if any remain
      const cleaned = rawJson.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn('Failed to parse strict JSON, attempting fallback parse:', parseErr);
      // Fallback fallback object with full text if JSON parsing failed
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

    res.json({
      success: true,
      data: parsedData,
      rawResponse: rawJson,
    });
  } catch (error: any) {
    console.error('Error in /api/transcribe-to-json:', error);
    const errorMessage = error?.message || 'Gagal mentranskripsi audio ke JSON.';
    res.status(500).json({
      error: errorMessage,
      details: error?.status || 'TRANSCRIPTION_ERROR',
    });
  }
});

/**
 * Text Enhancer: Helper to add authentic Indonesian-Arabic flavor to a plain sentence
 */
app.post('/api/enhance-text', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, mode = 'tausiyah' } = req.body;

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

    res.json({
      success: true,
      enhancedText: response.text?.trim() || text,
    });
  } catch (error: any) {
    console.error('Error in /api/enhance-text:', error);
    res.status(500).json({ error: error?.message || 'Gagal memperkaya teks.' });
  }
});

// Setup Vite in Dev or Serve Static in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static client files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
