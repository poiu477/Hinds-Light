import type { TranslationProvider } from '../TranslationProvider.js';
import { env } from '../../../config/env.js';
import fetch from 'node-fetch';

type SupportedModel = 'base' | 'nmt' | 'v2' | 'v3';

export class GoogleTranslationProvider implements TranslationProvider {
  private readonly apiKey: string;
  private readonly endpoint: string;

  constructor() {
    if (!env.GOOGLE_TRANSLATE_API_KEY) {
      throw new Error('Missing GOOGLE_TRANSLATE_API_KEY');
    }
    this.apiKey = env.GOOGLE_TRANSLATE_API_KEY;
    this.endpoint = 'https://translation.googleapis.com/language/translate/v2';
  }

  async translateText(text: string, from: string, to: string): Promise<string> {
    const body = new URLSearchParams();
    body.set('q', text);
    body.set('source', from);
    body.set('target', to);
    body.set('format', 'text');

    const res = await fetch(`${this.endpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Google Translate API error ${res.status}: ${detail}`);
    }

    const json = (await res.json()) as any;
    const translated = json?.data?.translations?.[0]?.translatedText;
    if (!translated) {
      throw new Error('Google Translate API response missing translatedText');
    }
    return translated;
  }
}



