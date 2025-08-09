import type { TranslationProvider } from '../TranslationProvider.js';

export class DummyTranslationProvider implements TranslationProvider {
  async translateText(text: string, _from: string, _to: string): Promise<string> {
    return text;
  }
}






