import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { BreadcrumbContext } from '@/contexts/BreadcrumbContext'
import React from 'react'
import { useState } from 'react'
import { Outlet } from '@tanstack/react-router'
//import logo from '@/assets/logos/icon-white.svg'

interface LayoutProps {
  children?: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [breadcrumbItems, setBreadcrumbItems] = useState<string[]>([])

  const handleBreadcrumbUpdate = (...items: string[]) => {
    setBreadcrumbItems(items)
  }

  return (
    <BreadcrumbContext.Provider
      value={{ updateBreadcrumb: handleBreadcrumbUpdate }}
    >
      <SidebarProvider>
        <div
          className="min-h-screen w-full bg-background text-foreground"
          data-admin="true"
        >
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background transition-[width,height] ease-linear">
              <div className="flex h-full items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbItems.map((item, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbItem>
                          {index === breadcrumbItems.length - 1 ? (
                            <BreadcrumbPage>{item}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href="#">{item}</BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <main className="flex-1 p-4">{children || <Outlet />}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </BreadcrumbContext.Provider>
  )
}
