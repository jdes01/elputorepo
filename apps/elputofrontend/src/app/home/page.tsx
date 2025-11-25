import { useTranslation } from 'react-i18next'

export function HomePage() {
  const { t } = useTranslation('home')

  return <>{t('TITLE')}</>
}
