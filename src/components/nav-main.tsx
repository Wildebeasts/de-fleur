'use client'

import { useNavigate } from '@tanstack/react-router'
import { ChevronRight, LucideIcon } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar'
import { memo } from 'react'

interface NavItem {
  title: string
  icon?: LucideIcon
  isActive?: boolean
  path?: string
  items?: {
    title: string
    path: string
    isActive?: boolean
  }[]
}

interface NavMainProps {
  items: NavItem[]
}

export const NavMain = memo(function NavMain({ items }: NavMainProps) {
  const navigate = useNavigate()

  const handleTabClick = (path: string): void => {
    navigate({ to: path })
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon

          if (!item.items?.length) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={item.isActive}
                  onClick={() => item.path && handleTabClick(item.path)}
                  className="text-foreground/80 hover:bg-muted hover:text-foreground"
                >
                  {Icon && <Icon strokeWidth={1.5} />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={item.isActive}
                    className="text-foreground/80 hover:bg-muted hover:text-foreground"
                  >
                    {Icon && <Icon strokeWidth={1.5} />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto text-muted-foreground/50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          onClick={() => handleTabClick(subItem.path)}
                          isActive={subItem.isActive}
                          className="text-muted-foreground/70 hover:bg-muted hover:text-foreground"
                        >
                          <span>{subItem.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
})
