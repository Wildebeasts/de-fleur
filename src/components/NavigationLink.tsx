import * as React from 'react'
import { Link } from '@tanstack/react-router'

interface NavigationLinkProps {
  label: string
  href: string
  className?: string
}

export function NavigationLink({
  label,
  href,
  className
}: NavigationLinkProps) {
  return (
    <Link
      to={href}
      className={`self-stretch hover:text-gray-700 focus:outline-none ${
        className || ''
      }`}
    >
      {label}
    </Link>
  )
}
