import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Search, Moon, Sun, Monitor, User, LogOut, Settings, Command } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { notificationsApi } from '../../services/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup } from '../ui/dropdown-menu'
import { SearchBar } from '../ui/search-bar'
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut } from '../ui/command'
import { Briefcase, Building, FileText, Calendar, LayoutDashboard } from 'lucide-react'

export default function Topbar() {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)

  const loadNotifications = async () => {
    try {
      const [items, count] = await Promise.all([notificationsApi.my(), notificationsApi.unreadCount()])
      setNotifications((items || []).slice(0, 5))
      setUnread(count?.count || 0)
    } catch {
      setNotifications([])
      setUnread(0)
    }
  }

  useEffect(() => {
    loadNotifications()
    const id = window.setInterval(loadNotifications, 60000)
    return () => window.clearInterval(id)
  }, [])

  // Handle Cmd+K / Ctrl+K keyboard shortcut for search
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const markAllRead = async () => {
    await notificationsApi.markAllRead()
    await loadNotifications()
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navigateTo = (path) => {
    setSearchOpen(false)
    navigate(path)
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 justify-between items-center gap-4 border-b border-slate-200 bg-white/75 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/75 sm:px-6">
        <div className="flex flex-1 items-center gap-4">
          {/* Search Bar / Command Palette Trigger */}
          <div className="w-full max-w-sm">
            <button
              onClick={() => setSearchOpen(true)}
              className="group relative flex w-full h-9 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-100 dark:focus:ring-brand-600"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Search...</span>
              </div>
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100 sm:flex dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 rounded-full h-9 w-9">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 rounded-full h-9 w-9">
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute right-2 top-2 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500"></span>
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between p-4">
                <span className="text-sm font-semibold">Notifications</span>
                {unread > 0 && (
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-brand-600 hover:text-brand-700 hover:bg-transparent dark:text-brand-400" onClick={markAllRead}>
                    Mark all read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <DropdownMenuItem key={n.id} className="items-start p-4 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium leading-none">{n.title}</span>
                          {!n.is_read && <span className="flex h-1.5 w-1.5 rounded-full bg-brand-500"></span>}
                        </div>
                        <span className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{n.message}</span>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No new notifications
                  </div>
                )}
              </div>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button variant="ghost" className="w-full justify-center text-sm" asChild>
                  <Link to="/notifications">View all notifications</Link>
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full select-none ml-2">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-brand-700 font-semibold ring-1 ring-slate-200 dark:bg-slate-800 dark:text-brand-400 dark:ring-slate-700 hover:ring-brand-500 transition-shadow">
                  {user?.email?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.full_name || 'User'}</p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
                    {user?.email}
                  </p>
                  <div className="mt-2 text-xs">
                    <Badge variant="outline" className="uppercase text-[10px]">{user?.role}</Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full cursor-pointer flex items-center">
                    <User className="mr-2 h-4 w-4 text-slate-500" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                   <Link to="/settings" className="w-full cursor-pointer flex items-center">
                    <Settings className="mr-2 h-4 w-4 text-slate-500" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => navigateTo('/dashboard')}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/jobs')}>
              <Briefcase className="mr-2 h-4 w-4" />
              <span>Jobs</span>
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/companies')}>
              <Building className="mr-2 h-4 w-4" />
              <span>Companies</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Tools">
             <CommandItem onSelect={() => navigateTo('/applications')}>
              <FileText className="mr-2 h-4 w-4" />
              <span>My Applications</span>
            </CommandItem>
            <CommandItem onSelect={() => navigateTo('/interviews')}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Interviews</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => navigateTo('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            {theme === 'dark' ? (
              <CommandItem onSelect={() => { setTheme('light'); setSearchOpen(false); }}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light Mode</span>
              </CommandItem>
            ) : (
               <CommandItem onSelect={() => { setTheme('dark'); setSearchOpen(false); }}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark Mode</span>
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      </>
  )
}
