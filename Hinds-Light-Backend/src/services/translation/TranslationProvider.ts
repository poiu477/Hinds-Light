import { env } from '../../config/env.js';

export interface TranslationProvider {
  translateText(text: string, from: string, to: string): Promise<string>;
}

import { DummyTranslationProvider } from './providers/dummy.js';
import { GoogleTranslationProvider } from './providers/google.js';

export function getTranslationProvider(): TranslationProvider {
  switch (env.TRANSLATION_PROVIDER) {
    case 'google':
      return new GoogleTranslationProvider();
    case 'dummy':
    default:
      return new DummyTranslationProvider();
  }
}






