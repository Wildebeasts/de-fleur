import { createFileRoute } from '@tanstack/react-router'
import SearchComponent from 'pages/store/SearchComponent'
import ShopSearchPage from 'pages/store/ShopSearchPage'

export const Route = createFileRoute('/shop')({
  component: ShopPage
})

function ShopPage() {
  return (
    <>
      <SearchComponent />
      <ShopSearchPage />
    </>
  )
}
