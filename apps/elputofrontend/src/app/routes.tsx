import { Navigate, Route, Routes } from 'react-router-dom'

import { ROUTES } from './constants'
import { HomePage } from './home/page'
import { Layout } from './layout'

export const AppRoutes = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path="*" element={<Navigate to={ROUTES.HOME} />} />
    </Route>
  </Routes>
)
