'use client'

import { EllipsisVertical, LogOutIcon, SettingsIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

import { ROUTES } from '../../app/constants'

type NavUserProps = {
  user: {
    email: string
    id: string
    name: string
  }
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar()
  const { t } = useTranslation()

  const hash = (string: string) => {
    let val = 0

    for (let i = 0; i < string.length; i += 1) {
      val = string.charCodeAt(i) + ((val << 5) - val)
    }

    return val & 360
  }

  const colorFromString = (string: string) => {
    const hashedValue = hash(string)
    return `hsl(${hashedValue} 50% 50%)`
  }

  const backgroundColor = user.id ? colorFromString(user.id) : 'grey.400'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarFallback
                  className="rounded-lg"
                  style={{ backgroundColor }}
                >
                  {user.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <Link to={ROUTES.SETTINGS}>
                <DropdownMenuItem className="cursor-pointer">
                  <SettingsIcon />
                  {t('SIDEBAR.ITEMS.SETTINGS')}
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="cursor-pointer">
                <LogOutIcon />
                {t('SIDEBAR.ITEMS.LOGOUT')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
