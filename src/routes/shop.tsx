import { createFileRoute } from '@tanstack/react-router'
import MobileShop from '@/pages/store/MobileShop'
import { useIsMobile } from '@/lib/hooks/use-mobile'
import SearchComponent from '@/pages/store/SearchComponent'
import ShopSearchPage from '@/pages/store/ShopSearchPage'

export const Route = createFileRoute('/shop')({
  component: ShopRoute
})

function ShopRoute() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MobileShop />
  }

  return (
    <>
      <SearchComponent />
      <ShopSearchPage />
    </>
  )
}
