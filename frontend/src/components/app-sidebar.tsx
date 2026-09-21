import * as React from "react"
import {

  IconInnerShadowTop,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type SidebarData = {
  primary: Array<{ title: string; url: string; icon?: React.ComponentType }>
  secondary: Array<{ title: string; url: string; icon?: React.ComponentType }>
}

type UserData = {
  name: string
  email: string
  avatar?: string
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  sidebar?: SidebarData
  title?: string
  user?: UserData
}

export function AppSidebar({ 
  sidebar = { primary: [], secondary: [] }, 
  title = "Dashboard", 
  user = { name: "User", email: "user@example.com" },
  ...props 
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">{title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebar.primary} />
        {sidebar.secondary.length > 0 && (
          <>
            <div className="mx-4 my-2 border-t border-sidebar-border" />
            <NavSecondary items={sidebar.secondary} />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onlyAccountLogout />
      </SidebarFooter>
    </Sidebar>
  )
}
