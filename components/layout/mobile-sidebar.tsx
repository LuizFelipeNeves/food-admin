'use client';

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { sidebarLinks } from './sidebar'

export function MobileSidebar() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <SheetTitle className="p-4 border-b">
          <span className="text-xl font-bold">Burger Admin</span>
        </SheetTitle>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="space-y-2 p-2">
            {sidebarLinks.map((route) => (
              <Link 
                key={route.href} 
                href={route.href}
                onClick={() => setOpen(false)}
              >
                <Button
                  variant={pathname === route.href ? 'default' : 'ghost'}
                  className="w-full justify-start px-4"
                >
                  <route.icon className={cn('h-4 w-4', route.color)} />
                  <span className="ml-2">{route.title}</span>
                </Button>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
