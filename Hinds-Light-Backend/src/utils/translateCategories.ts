import { getTranslationProvider } from '../services/translation/TranslationProvider.js';
import { redis } from '../lib/redis.js';

const translator = getTranslationProvider();

const CATEGORY_CACHE_PREFIX = 'translation:category:v1';
// Categories are fairly stable; cache long-term
const CATEGORY_CACHE_TTL_SECONDS = 60 * 60 * 24 * 180; // 180 days

function normalizeCategory(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

function cacheKey(fromLang: string, toLang: string, normalizedCategory: string): string {
  return `${CATEGORY_CACHE_PREFIX}:${fromLang}:${toLang}:${normalizedCategory}`;
}

/**
 * Translates an array of Hebrew categories to English with Redis caching and input de-duplication.
 */
export async function translateCategories(
  hebrewCategories: string[],
  fromLang = 'he',
  toLang = 'en'
): Promise<string[]> {
  if (!hebrewCategories || hebrewCategories.length === 0) return [];

  // 1) Normalize and de-duplicate input categories
  const normalizedToOriginal = new Map<string, string[]>();
  for (const raw of hebrewCategories) {
    const normalized = normalizeCategory(raw);
    if (!normalized) continue;
    if (!normalizedToOriginal.has(normalized)) normalizedToOriginal.set(normalized, []);
    normalizedToOriginal.get(normalized)!.push(raw);
  }
  const uniqueNormalized = Array.from(normalizedToOriginal.keys());
  if (uniqueNormalized.length === 0) return [];

  // 2) Check Redis cache for existing translations
  const keys = uniqueNormalized.map((n) => cacheKey(fromLang, toLang, n));
  let cachedValues: (string | null)[] = [];
  try {
    cachedValues = await redis.mget(keys as any);
  } catch (err) {
    // If Redis is unavailable, proceed without cache
    cachedValues = new Array<string | null>(keys.length).fill(null);
    console.error('[translateCategories] Redis mget failed:', (err as any)?.message || err);
  }

  const normalizedToTranslation = new Map<string, string>();
  const misses: string[] = [];
  uniqueNormalized.forEach((n, idx) => {
    const hit = cachedValues[idx];
    if (hit && hit.trim()) {
      normalizedToTranslation.set(n, hit.trim());
    } else {
      misses.push(n);
    }
  });

  // 3) Translate cache misses (sequentially to avoid burst rate limits)
  for (const n of misses) {
    try {
      const translated = (await translator.translateText(n, fromLang, toLang)).trim();
      if (translated) {
        normalizedToTranslation.set(n, translated);
        // Store in Redis with TTL
        const key = cacheKey(fromLang, toLang, n);
        try {
          await redis.set(key, translated, 'EX', CATEGORY_CACHE_TTL_SECONDS);
        } catch (err) {
          // Non-fatal if Redis set fails
          console.error('[translateCategories] Redis set failed:', (err as any)?.message || err);
        }
      }
    } catch (error) {
      console.error(`[translateCategories] Failed to translate category "${n}":`, (error as any)?.message || error);
    }
  }

  // 4) Build final list: use translations for inputs, dedupe results, drop empties
  const translatedCategories: string[] = [];
  for (const original of hebrewCategories) {
    const n = normalizeCategory(original);
    const translated = normalizedToTranslation.get(n);
    if (translated) translatedCategories.push(translated);
  }

  return Array.from(new Set(translatedCategories.filter((t) => t && t.trim())));
}

/**
 * Helper to translate a single category with Redis caching.
 */
export async function translateCategory(
  hebrewCategory: string,
  fromLang = 'he',
  toLang = 'en'
): Promise<string> {
  const normalized = normalizeCategory(hebrewCategory);
  if (!normalized) return '';
  const key = cacheKey(fromLang, toLang, normalized);

  try {
    const cached = await redis.get(key);
    if (cached && cached.trim()) return cached.trim();
  } catch (err) {
    console.error('[translateCategory] Redis get failed:', (err as any)?.message || err);
  }

  try {
    const translated = (await translator.translateText(normalized, fromLang, toLang)).trim();
    if (translated) {
      try {
        await redis.set(key, translated, 'EX', CATEGORY_CACHE_TTL_SECONDS);
      } catch (err) {
        console.error('[translateCategory] Redis set failed:', (err as any)?.message || err);
      }
      return translated;
    }
  } catch (error) {
    console.error(`Error translating category "${hebrewCategory}":`, (error as any)?.message || error);
  }
  return '';
}
