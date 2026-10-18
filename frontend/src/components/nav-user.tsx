import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
  IconSettings,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AccountForm } from "./account-form"
import { authClient } from "@/hooks/auth/auth-client"
import { toast } from "sonner"

export function NavUser({
  user,
  onlyAccountLogout,
}: {
  user: {
    name: string
    email: string
    avatar?: string
    id?: string
  }
  onlyAccountLogout?: boolean
}) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await (authClient.signOut as any)()
      toast.success("Logged out successfully")
      window.location.href = "/login"
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  const handleLogoutClick = () => {
    setIsLogoutOpen(true)
  }

  const handleAccountClick = () => {
    setIsAccountOpen(true)
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleAccountClick}>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              {onlyAccountLogout ? null : (
                <>
                  <DropdownMenuItem>
                    <IconCreditCard />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconNotification />
                    Notifications
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogoutClick}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      
      <Sheet open={isAccountOpen} onOpenChange={setIsAccountOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Account Settings</SheetTitle>
            <SheetDescription>
              Update your name and password.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 px-4 sm:px-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            <AccountForm
              initialData={{ name: user.name, id: user.id || "" }}
              onSuccess={() => setIsAccountOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      <AlertDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Log out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenu>
  )
}
