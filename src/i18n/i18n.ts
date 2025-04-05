import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enUS from './locales/en-US.json'
import it from './locales/it.json'
import nl from './locales/nl.json'
import fr from './locales/fr.json'
import de from './locales/de.json'

// Initialize i18next
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Default language
    fallbackLng: 'en-US',
    // Debug mode
    debug: false,
    // Resources containing translations
    resources: {
      'en-US': {
        translation: enUS
      },
      it: {
        translation: it
      },
      nl: {
        translation: nl
      },
      fr: {
        translation: fr
      },
      de: {
        translation: de
      }
    },
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    // Interpolation configuration
    interpolation: {
      escapeValue: false // React already escapes values
    }
  })

export default i18n
