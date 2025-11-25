import { Building2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'

import { NavUser } from '@/components/ui/nav-user'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '../components/ui/sidebar'
import { ROUTES } from './constants'

export const Layout = () => {
  const { t } = useTranslation()

  const items = [
    {
      icon: Building2Icon,
      label: t('SIDEBAR.ITEMS.EVENTS'),
      url: ROUTES.EVENTS,
    },
  ]

  const user = {
    email: 'mock@example.com',
    id: 'hola',
    name: 'Mock user',
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t('SIDEBAR.TITLE')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      </Sidebar>
      <main className="p-5 flex gap-6 w-full">
        <SidebarTrigger />
        <div className="pt-10 px-40 w-full mx-auto max-w-350">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}
