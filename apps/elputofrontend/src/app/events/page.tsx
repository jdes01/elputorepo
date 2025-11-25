import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useGetEvents } from '../../hooks/events/useGetEvents'

export function EventsPage() {
  const { t } = useTranslation('events')
  const { data: events } = useGetEvents()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{t('TITLE')}</h1>
        <p className="text-sm text-muted-foreground">{t('DESCRIPTION')}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((event) => (
          <Card
            key={event.id}
            className="rounded-2xl shadow-sm overflow-hidden"
          >
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-36 object-cover"
            />
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                {event.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {event.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
