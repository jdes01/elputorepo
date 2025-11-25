import { Navigate, Route, Routes } from 'react-router-dom'

import { ROUTES } from './constants'
import { EventsPage } from './events/page'
import { Layout } from './layout'
import { SettingsPage } from './settings/page'

export const AppRoutes = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path={ROUTES.EVENTS} element={<EventsPage />} />
      <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
      <Route path="*" element={<Navigate to={ROUTES.EVENTS} />} />
    </Route>
  </Routes>
)
