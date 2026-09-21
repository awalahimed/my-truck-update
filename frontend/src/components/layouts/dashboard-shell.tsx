import * as React from "react"
import { SidebarProvider, SidebarInset } from "../ui/sidebar"
import { SiteHeader } from "../site-header"
import { AppSidebar } from "../app-sidebar"

type SidebarData = {
  primary: Array<{ title: string; url: string; icon?: React.ComponentType }>
  secondary: Array<{ title: string; url: string; icon?: React.ComponentType }>
}

type UserData = {
  name: string
  email: string
  avatar?: string
}

type DashboardShellProps = React.PropsWithChildren<{
  sidebar?: SidebarData
  title?: string
  user?: UserData
  headerActions?: React.ReactNode
}>

export function DashboardShell({ 
  children, 
  sidebar, 
  title = "Dashboard", 
  user, 
  headerActions 
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar sidebar={sidebar} title={title} user={user} />
      <SidebarInset>
        <SiteHeader>
          {headerActions}
        </SiteHeader>
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default DashboardShell


