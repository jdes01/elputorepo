import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    debug: true,
    defaultNS: 'translation',
    fallbackLng: 'es',
    fallbackNS: 'translation',
    interpolation: { escapeValue: false },
    lng: 'es',
    react: { useSuspense: true },
  })

export default i18n
