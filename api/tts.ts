import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client with v1beta and telemetry header
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
  // CORS headers for external hosts/Vercel
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
    const { text, voice = 'Puck', style = 'Santun dan fasih', accentIntensity = 'moderate' } = req.body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Teks tidak boleh kosong.' });
      return;
    }

    if (!apiKey && !process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di server/Vercel Environment Variables.',
      });
      return;
    }

    // Dynamic style instruction
    let intensityGuide = 'intonasi natural perpaduan bahasa Indonesia fasih dengan pengucapan istilah/doa Arab yang tepat makhrajnya';
    if (accentIntensity === 'strong') {
      intensityGuide = 'gaya tausiyah/khutbah atau ustadz yang fasih bertajwid, artikulasi makhraj Arab sangat jelas dan tartil';
    } else if (accentIntensity === 'light') {
      intensityGuide = 'bahasa Indonesia modern yang ramah dan luwes, dengan pelafalan istilah Arab yang lembut dan wajar';
    }

    const styleInstruction = `Gaya: ${style}. Karakter suara: ${intensityGuide}. Bacakan teks berbahasa Indonesia berikut dengan pelafalan istilah Arab/Islami yang benar dan fasih.`;

    const validVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const chosenVoice = validVoices.includes(voice) ? voice : 'Puck';

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

    res.status(200).json({
      success: true,
      audioBase64: base64Audio,
      mimeType: candidatePart?.inlineData?.mimeType || 'audio/wav',
      voice: chosenVoice,
      textLength: text.length,
    });
  } catch (error: any) {
    console.error('Error in tts handler:', error);
    let errorMsg = error?.message || 'Terjadi kesalahan saat memproses text-to-speech.';
    try {
      if (typeof errorMsg === 'string' && errorMsg.trim().startsWith('{')) {
        const parsed = JSON.parse(errorMsg);
        if (parsed?.error?.message) {
          errorMsg = parsed.error.message;
        }
      }
    } catch {}

    if (errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE') || errorMsg.includes('high demand')) {
      errorMsg = 'Layanan AI sedang mengalami lonjakan permintaan sesaat (503). Silakan coba klik tombol kembali beberapa detik kemudian.';
    } else if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      errorMsg = 'Kuota permintaan API sedang padat (429). Mohon tunggu beberapa saat.';
    }

    res.status(500).json({
      error: errorMsg,
      details: error?.status || 'INTERNAL_ERROR',
    });
  }
}
