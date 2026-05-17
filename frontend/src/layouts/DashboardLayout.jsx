import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/nav/Sidebar'
import Topbar from '../components/nav/Topbar'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // When used with react-router-dom Outlet, children will be undefined, so we render Outlet or children
  const content = children || <Outlet />

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Sidebar overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-card transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b">
          <div className="font-bold tracking-tighter text-xl">
             Campus<span className="text-primary">Connect</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="flex-1 py-6 px-4">
           <Sidebar onItemClick={() => setIsMobileMenuOpen(false)} />
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden w-full relative">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 w-full sticky top-0 z-40">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden shrink-0" 
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          <div className="flex-1 flex items-center justify-end">
            <Topbar />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-7xl">
            {content}
          </div>
        </main>
      </div>
    </div>
  )
}
