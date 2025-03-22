import React from 'react'
import { useIsMobile } from '../hooks/use-mobile'
import { motion } from 'framer-motion'
import { Home, ShoppingBag, Heart, User, Sparkles } from 'lucide-react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import Header from './Header'
import FooterWrapper from './index'

interface MobileWrapperProps {
  children: React.ReactNode
}

export default function MobileWrapper({ children }: MobileWrapperProps) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  // If not on mobile, render with header and footer
  if (!isMobile) {
    return (
      <>
        <Header />
        <main>{children}</main>
        <FooterWrapper />
      </>
    )
  }

  // Mobile app-like experience - no header but with bottom navigation
  return (
    <div className="flex min-h-screen flex-col">
      {/* No header for mobile views */}

      {/* Mobile app content */}
      <main className="flex-1 pb-16">{children}</main>

      {/* App-like bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-200 bg-white shadow-lg">
        <div className="mx-auto flex h-16 max-w-md items-center justify-between px-6">
          <TabButton
            icon={<Home className="size-5" />}
            label="Home"
            isActive={currentPath === '/'}
            onClick={() => navigate({ to: '/' })}
          />
          <TabButton
            icon={<ShoppingBag className="size-5" />}
            label="Shop"
            isActive={
              currentPath === '/shop' || currentPath.includes('/product')
            }
            onClick={() => navigate({ to: '/shop' })}
          />
          <TabButton
            icon={<Sparkles className="size-5" />}
            label="Results"
            isActive={currentPath === '/quiz_result'}
            onClick={() => navigate({ to: '/quiz_result' })}
          />
          <TabButton
            icon={<Heart className="size-5" />}
            label="Wishlist"
            isActive={currentPath === '/wishlist'}
            onClick={() => navigate({ to: '/wishlist' })}
          />
          <TabButton
            icon={<User className="size-5" />}
            label="Account"
            isActive={currentPath.includes('/account_manage')}
            onClick={() => navigate({ to: '/account_manage' })}
          />
        </div>
      </nav>
    </div>
  )
}

interface TabButtonProps {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}

function TabButton({ icon, label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      className="flex flex-col items-center justify-center"
      onClick={onClick}
    >
      <div className={`mb-1 ${isActive ? 'text-[#3A4D39]' : 'text-gray-400'}`}>
        {icon}
      </div>
      <span
        className={`text-xs ${isActive ? 'font-medium text-[#3A4D39]' : 'text-gray-500'}`}
      >
        {label}
      </span>
      {isActive && (
        <motion.div
          layoutId="active-tab"
          className="absolute -top-1 h-1 w-5 rounded-b-full bg-[#3A4D39]"
        />
      )}
    </button>
  )
}
