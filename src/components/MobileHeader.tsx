import React from 'react'
import { motion } from 'framer-motion'
import { Search, Heart, ShoppingBag, Menu } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/context/AuthContext'

export default function MobileHeader() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 shadow-sm backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            className="rounded-full p-2 active:bg-gray-100"
            onClick={() => {
              // Implement mobile menu functionality
            }}
          >
            <Menu className="size-5 text-[#3A4D39]" />
          </button>
          <span
            className="text-lg font-semibold text-[#3A4D39]"
            onClick={() => navigate({ to: '/' })}
          >
            Skincare
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="rounded-full p-2 active:bg-gray-100"
            onClick={() => navigate({ to: '/search' })}
          >
            <Search className="size-5 text-[#3A4D39]" />
          </button>
          <button
            className="rounded-full p-2 active:bg-gray-100"
            onClick={() => navigate({ to: '/wishlist' })}
          >
            <Heart className="size-5 text-[#3A4D39]" />
          </button>
          {isAuthenticated && (
            <button
              className="rounded-full p-2 active:bg-gray-100"
              onClick={() => navigate({ to: '/cart' })}
            >
              <ShoppingBag className="size-5 text-[#3A4D39]" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
