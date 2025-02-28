import { useEffect } from 'react'
import { useBreadcrumb } from '@/lib/context/BreadcrumbContext'

interface BreadcrumbUpdaterProps {
  items: string[]
  previousItems: string[]
}

export const BreadcrumbUpdater = ({
  items,
  previousItems
}: BreadcrumbUpdaterProps) => {
  const { updateBreadcrumb } = useBreadcrumb()

  useEffect(() => {
    updateBreadcrumb(...items)
    return () => updateBreadcrumb(...previousItems)
  }, []) // Empty dependency array since values never change

  return null
}
