import { getTranslationProvider } from '../services/translation/TranslationProvider.js';

const translator = getTranslationProvider();

/**
 * Translates an array of Hebrew categories to English
 */
export async function translateCategories(
  hebrewCategories: string[], 
  fromLang = 'he', 
  toLang = 'en'
): Promise<string[]> {
  if (hebrewCategories.length === 0) {
    return [];
  }

  try {
    // Translate each category individually for better accuracy
    const translationPromises = hebrewCategories.map(category => 
      translator.translateText(category.trim(), fromLang, toLang)
    );
    
    const translatedCategories = await Promise.all(translationPromises);
    
    // Clean up and deduplicate translations
    return [...new Set(translatedCategories
      .map(cat => cat.trim())
      .filter(cat => cat.length > 0)
    )];
    
  } catch (error) {
    console.error('Error translating categories:', error);
    // Return empty array on error rather than original Hebrew categories
    // This way the UI won't show Hebrew text if translation fails
    return [];
  }
}

/**
 * Helper to translate a single category
 */
export async function translateCategory(
  hebrewCategory: string, 
  fromLang = 'he', 
  toLang = 'en'
): Promise<string> {
  try {
    return await translator.translateText(hebrewCategory.trim(), fromLang, toLang);
  } catch (error) {
    console.error(`Error translating category "${hebrewCategory}":`, error);
    return ''; // Return empty string on error
  }
}
