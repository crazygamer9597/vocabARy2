// Translation service
// This would normally use a real translation API like Google Translate or DeepL

// Cache translations to avoid duplicate API calls
const translationCache: Record<string, Record<string, string>> = {};

// Predefined translations for common objects in different languages
const predefinedTranslations: Record<string, Record<string, string>> = {
  'es': { // Spanish
    'chair': 'silla',
    'table': 'mesa',
    'cup': 'taza',
    'book': 'libro',
    'computer': 'computadora',
    'phone': 'teléfono',
    'dog': 'perro',
    'cat': 'gato',
    'car': 'coche',
    'door': 'puerta',
    'window': 'ventana',
    'bottle': 'botella',
    'television': 'televisión',
    'remote': 'control remoto',
    'couch': 'sofá',
    'lamp': 'lámpara',
    'refrigerator': 'refrigerador',
    'clock': 'reloj',
    'backpack': 'mochila',
    'shoe': 'zapato',
    'person': 'persona',
    'bicycle': 'bicicleta',
    'keyboard': 'teclado',
    'mouse': 'ratón',
    'plant': 'planta',
    'cup': 'taza',
    'bowl': 'tazón',
    'fork': 'tenedor',
    'knife': 'cuchillo',
    'spoon': 'cuchara',
    'banana': 'plátano',
    'apple': 'manzana',
    'sandwich': 'sándwich',
    'orange': 'naranja',
  },
  'fr': { // French
    'chair': 'chaise',
    'table': 'table',
    'cup': 'tasse',
    'book': 'livre',
    'computer': 'ordinateur',
    'phone': 'téléphone',
    'dog': 'chien',
    'cat': 'chat',
    'car': 'voiture',
    'door': 'porte',
    'window': 'fenêtre',
    'bottle': 'bouteille',
    'television': 'télévision',
    'remote': 'télécommande',
    'couch': 'canapé',
    'lamp': 'lampe',
    'refrigerator': 'réfrigérateur',
    'clock': 'horloge',
    'backpack': 'sac à dos',
    'shoe': 'chaussure',
    'person': 'personne',
    'bicycle': 'vélo',
    'keyboard': 'clavier',
    'mouse': 'souris',
    'plant': 'plante',
    'cup': 'tasse',
    'bowl': 'bol',
    'fork': 'fourchette',
    'knife': 'couteau',
    'spoon': 'cuillère',
    'banana': 'banane',
    'apple': 'pomme',
    'sandwich': 'sandwich',
    'orange': 'orange',
  },
  'de': { // German
    'chair': 'Stuhl',
    'table': 'Tisch',
    'cup': 'Tasse',
    'book': 'Buch',
    'computer': 'Computer',
    'phone': 'Telefon',
    'dog': 'Hund',
    'cat': 'Katze',
    'car': 'Auto',
    'door': 'Tür',
    'window': 'Fenster',
    'bottle': 'Flasche',
    'television': 'Fernseher',
    'remote': 'Fernbedienung',
    'couch': 'Sofa',
    'lamp': 'Lampe',
    'refrigerator': 'Kühlschrank',
    'clock': 'Uhr',
    'backpack': 'Rucksack',
    'shoe': 'Schuh',
    'person': 'Person',
    'bicycle': 'Fahrrad',
    'keyboard': 'Tastatur',
    'mouse': 'Maus',
    'plant': 'Pflanze',
    'cup': 'Tasse',
    'bowl': 'Schüssel',
    'fork': 'Gabel',
    'knife': 'Messer',
    'spoon': 'Löffel',
    'banana': 'Banane',
    'apple': 'Apfel',
    'sandwich': 'Sandwich',
    'orange': 'Orange',
  },
  'ja': { // Japanese
    'chair': 'いす',
    'table': 'テーブル',
    'cup': 'カップ',
    'book': '本',
    'computer': 'コンピュータ',
    'phone': '電話',
    'dog': '犬',
    'cat': '猫',
    'car': '車',
    'door': 'ドア',
    'window': '窓',
    'bottle': 'ボトル',
    'television': 'テレビ',
    'remote': 'リモコン',
    'couch': 'ソファ',
    'lamp': 'ランプ',
    'refrigerator': '冷蔵庫',
    'clock': '時計',
    'backpack': 'バックパック',
    'shoe': '靴',
    'person': '人',
    'bicycle': '自転車',
    'keyboard': 'キーボード',
    'mouse': 'マウス',
    'plant': '植物',
    'cup': 'カップ',
    'bowl': 'ボウル',
    'fork': 'フォーク',
    'knife': 'ナイフ',
    'spoon': 'スプーン',
    'banana': 'バナナ',
    'apple': 'りんご',
    'sandwich': 'サンドイッチ',
    'orange': 'オレンジ',
  },
};

/**
 * Get translation for a word in the specified language
 */
export async function getTranslation(word: string, languageCode: string): Promise<string> {
  // Normalize the word (lowercase for lookup)
  const normalizedWord = word.toLowerCase();
  
  // Check if we have the translation in cache
  if (translationCache[languageCode]?.[normalizedWord]) {
    return translationCache[languageCode][normalizedWord];
  }
  
  // Check if we have a predefined translation
  if (predefinedTranslations[languageCode]?.[normalizedWord]) {
    // Cache the translation
    if (!translationCache[languageCode]) {
      translationCache[languageCode] = {};
    }
    translationCache[languageCode][normalizedWord] = predefinedTranslations[languageCode][normalizedWord];
    return predefinedTranslations[languageCode][normalizedWord];
  }
  
  // In a real application, we would call a translation API here
  // For now, just return the original word with a language-specific suffix
  const languageSuffixes: Record<string, string> = {
    'es': ' (es)',
    'fr': ' (fr)',
    'de': ' (de)',
    'ja': ' (ja)',
  };
  
  const translation = word + (languageSuffixes[languageCode] || '');
  
  // Cache the translation
  if (!translationCache[languageCode]) {
    translationCache[languageCode] = {};
  }
  translationCache[languageCode][normalizedWord] = translation;
  
  return translation;
}
