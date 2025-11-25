import { useTranslation } from 'react-i18next'

export function EventsPage() {
  const { t } = useTranslation('events')

  return <>{t('TITLE')}</>
}
