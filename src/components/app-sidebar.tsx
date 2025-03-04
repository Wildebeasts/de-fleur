'use client'

import * as React from 'react'
import {
  ShoppingBag,
  CheckCircle,
  CreditCard,
  GalleryVerticalEnd,
  //GraduationCap,
  Home,
  //Settings2,
  Flag,
  Users
} from 'lucide-react'
import { useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
} from '@/components/ui/sidebar'
import userApi from '@/lib/services/userService'

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  teams: [
    {
      name: 'De Fleur',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise'
    }
  ],
  navMain: [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/admin',
      isStandalone: true
    },
    {
      title: 'Cosmetics',
      icon: ShoppingBag,
      items: [
        {
          title: 'All Cosmetics',
          path: '/admin/cosmetics'
        },
        {
          title: 'Cosmetic Types',
          path: '/admin/cosmetic-types'
        },
        {
          title: 'Skin Types',
          path: '/admin/cosmetics/skin-type'
        },
        {
          title: 'Brands',
          path: '/admin/cosmetics/brand_list'
        }
      ]
    },
    {
      title: 'Users',
      icon: Users,
      items: [
        {
          title: 'All Users',
          path: '/admin/users'
        }
      ]
    },
    {
      title: 'Approvals',
      icon: CheckCircle,
      items: [
        {
          title: 'Pending Courses',
          path: '/admin/approvals/pending'
        },
        {
          title: 'Approved Items',
          path: '/admin/approvals/approved',
          url: '/admin/approved-items'
        }
      ]
    },
    // {
    //   title: "Instructors",
    //   icon: GraduationCap,
    //   items: [
    //     {
    //       title: "All Instructors",
    //       path: "/admin/instructors",
    //     },
    //     {
    //       title: "Add Instructor",
    //       path: "/admin/instructors/add",
    //     },
    //     {
    //       title: "Performance",
    //       path: "/admin/instructors/performance",
    //     },
    //     {
    //       title: "Payouts",
    //       path: "/admin/instructors/payouts",
    //     }
    //   ],
    // },
    {
      title: 'Payments',
      icon: CreditCard,
      items: [
        {
          title: 'Invoices',
          path: '/admin/payments/invoices'
        },
        {
          title: 'Transactions',
          path: '/admin/payments/transactions'
        },
        {
          title: 'Wallets',
          path: '/admin/payments/wallets'
        },
        {
          title: 'System Accounts',
          path: '/admin/payments/system'
        }
      ]
    },
    {
      title: 'Issue Tickets',
      icon: Flag,
      items: [
        {
          title: 'Reports',
          path: '/admin/issue-tickets/reports'
        }
      ]
    }
    // {
    //   title: "Settings",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "General",
    //       path: "/admin/settings/general",
    //     },
    //     {
    //       title: "Site Settings",
    //       path: "/admin/settings/site",
    //     },
    //     {
    //       title: "Notifications",
    //       path: "/admin/settings/notifications",
    //     },
    //     {
    //       title: "Security",
    //       path: "/admin/settings/security",
    //     }
    //   ],
    // },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const pathname = router.state.location.pathname
  const [user, setUser] = useState({
    name: '',
    email: '',
    avatar: ''
  })
  const [userRoles, setUserRoles] = useState<string[]>([])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profile = await userApi.getUserProfile()
        setUser({
          name: profile.firstName || profile.username,
          email: profile.email || '',
          avatar: profile.avatarUrl || ''
        })
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
      }
    }

    const fetchUserRoles = async () => {
      try {
        const roles = await userApi.getUserRoles()
        setUserRoles(roles)
      } catch (error) {
        console.error('Failed to fetch user roles:', error)
      }
    }

    fetchUserData()
    fetchUserRoles()
  }, [])

  const navMainWithActive = data.navMain.map((section) => {
    // Skip items check if there are no subitems
    if (!section.items) {
      return {
        ...section,
        isActive: pathname === section.path,
        items: [] // Provide empty array for consistency
      }
    }

    // Check if any item in this section matches the current path
    const hasActiveItem = section.items.some(
      (item) => pathname === item.path || pathname === item.url
    )

    return {
      ...section,
      isActive: hasActiveItem,
      items: section.items.map((item) => ({
        ...item,
        isActive: pathname === item.path || pathname === item.url
      }))
    }
  })

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithActive} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} roles={userRoles} />
      </SidebarFooter>
    </Sidebar>
  )
}
