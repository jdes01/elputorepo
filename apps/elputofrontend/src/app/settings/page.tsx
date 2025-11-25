import { useTranslation } from 'react-i18next'

export function SettingsPage() {
  const { t } = useTranslation('settings')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{t('TITLE')}</h1>
        <p className="text-sm text-muted-foreground">{t('DESCRIPTION')}</p>
      </div>
    </div>
  )
}
