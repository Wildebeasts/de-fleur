/* eslint-disable tailwindcss/no-custom-classname */
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
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { BreadcrumbProvider } from '@/lib/context/BreadcrumbContext'
import React, { useState } from 'react'
import logo from '@/assets/logos/icon-white.svg'
import { ThemeProvider } from 'next-themes'
import { ThemeToggle } from '@/components/theme-toggle'

interface LayoutProps {
  parentTitle?: string
  title?: string
  subtitle?: string
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [breadcrumbItems, setBreadcrumbItems] = useState([
    {
      label: 'Admin Dashboard',
      path: '/admin'
    }
  ])

  const handleBreadcrumbUpdate = (...items: string[]) => {
    // Convert the string array to the breadcrumb items format
    const newBreadcrumbs = items.map((item, index) => {
      // For the first item, use the admin path
      if (index === 0) {
        return {
          label: item,
          path: '/admin'
        }
      }

      // For other items, construct a path or use empty string for the last item
      return {
        label: item,
        path:
          index === items.length - 1
            ? ''
            : `/admin/${item.toLowerCase().replace(/\s+/g, '-')}`
      }
    })

    setBreadcrumbItems(newBreadcrumbs)
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
    >
      <BreadcrumbProvider onUpdate={handleBreadcrumbUpdate}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 bg-sidebar transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <div className="flex size-full items-center justify-between px-4 text-white">
                <div className="flex h-full items-center gap-2">
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <Breadcrumb>
                    <BreadcrumbList className="py-0 leading-none">
                      {breadcrumbItems.map((item, index) => (
                        <React.Fragment key={index}>
                          {index > 0 && (
                            <BreadcrumbSeparator className="hidden leading-none md:block" />
                          )}
                          <BreadcrumbItem className="hidden md:block">
                            {index === breadcrumbItems.length - 1 ? (
                              <BreadcrumbPage className="py-0 leading-none text-white">
                                {item.label}
                              </BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink
                                href={item.path}
                                className="py-0 leading-none"
                              >
                                {item.label}
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <div className="relative flex flex-1 flex-col gap-4 overflow-hidden bg-[#1a1b24] p-4 pt-0 text-gray-900">
              <div className="animate-diagonal-scroll absolute inset-0">
                <img
                  src={logo}
                  alt="logo"
                  className="pointer-events-none size-[200%] scale-[3] opacity-100"
                />
              </div>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <svg
                  width="2000"
                  height="1200"
                  viewBox="0 0 2000 1200"
                  className="opacity-100"
                >
                  <defs>
                    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(59,130,246,0.95)" />
                      <stop offset="30%" stopColor="rgba(59,130,246,0.6)" />
                      <stop offset="60%" stopColor="rgba(59,130,246,0.3)" />
                      <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                    </radialGradient>
                  </defs>
                  <ellipse
                    cx="1000"
                    cy="600"
                    rx="900"
                    ry="400"
                    fill="url(#glow)"
                    filter="blur(100px)"
                  />
                </svg>
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1a1b24]/80 via-[#1a1b24]/80 to-[#1a1b24]/90" />

              <div className="relative z-10">{children}</div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </BreadcrumbProvider>
    </ThemeProvider>
  )
}
