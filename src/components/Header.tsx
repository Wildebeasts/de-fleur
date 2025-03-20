import * as React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { NavigationLink } from './NavigationLink'
import { SearchBar } from './SearchBar'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/button'

interface NavigationItem {
  label: string
  href: string
}

const navigationItems: NavigationItem[] = [
  { label: 'Shop', href: '/shop' },
  { label: 'Blog', href: '/blog' },
  { label: 'Collections', href: '/collections' },
  { label: 'About', href: '/about' },
  { label: 'Play', href: '/unity_game' }
]

const CartIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    xmlns="http://www.w3.org/2000/svg"
    className="transition-colors duration-300 hover:stroke-[#3A4D39]"
  >
    <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" />
    <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" />
    <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" />
  </svg>
)

const UserIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    xmlns="http://www.w3.org/2000/svg"
    className="transition-colors duration-300 hover:stroke-[#3A4D39]"
  >
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" />
    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" />
  </svg>
)

export default function Header() {
  const { scrollY } = useScroll()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Transform values based on scroll position
  const headerHeight = useTransform(scrollY, [0, 100], ['5rem', '4rem'])
  const headerBackground = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.95)']
  )
  const headerShadow = useTransform(
    scrollY,
    [0, 100],
    ['none', '0 2px 10px rgba(0, 0, 0, 0.1)']
  )
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.9])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      style={{
        height: headerHeight,
        backgroundColor: headerBackground,
        boxShadow: headerShadow
      }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-10 flex w-full flex-col justify-center border-b border-gray-100 px-16 py-px backdrop-blur-sm transition-all duration-300 max-md:max-w-full max-md:px-5"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="z-50 flex w-full flex-col max-md:max-w-full">
        <div className="flex w-full flex-wrap justify-between gap-5 max-md:max-w-full">
          <div className="flex flex-wrap gap-16 self-start pb-2 pt-0.5 leading-none text-[#3A4D39] max-md:max-w-full">
            <motion.div
              style={{ scale: logoScale }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <NavigationLink
                href="/"
                label="De Fleur"
                className="items-center justify-center text-3xl font-semibold"
              />
            </motion.div>
            <div className="mt-1.5 flex flex-auto items-start gap-8 self-start py-1 text-sm">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <NavigationLink className="text-lg" {...item} />
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div
            className="flex items-center gap-8 text-sm text-gray-400"
            style={{ scale: logoScale }}
          >
            <SearchBar />
            <motion.div
              className="flex gap-4"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {isAuthenticated ? (
                <button
                  aria-label="User account"
                  className="text-gray-600"
                  onClick={() => navigate({ to: '/account_manage' })}
                >
                  <UserIcon />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate({
                          to: '/login',
                          search: {
                            redirect: location.pathname
                          }
                        })
                      }
                      className="text-sm font-medium text-gray-700 hover:text-[#3A4D39]"
                    >
                      Login
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate({ to: '/register' })}
                      className="bg-[#3A4D39] text-sm font-medium text-white hover:bg-[#2C3C2A]"
                    >
                      Sign up
                    </Button>
                  </motion.div>
                </div>
              )}

              {isAuthenticated && (
                <Link to="/cart" aria-label="Shopping cart">
                  <CartIcon />
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  )
}
