import { Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div>
      <p>Layout</p>
      <Outlet />
    </div>
  )
}
