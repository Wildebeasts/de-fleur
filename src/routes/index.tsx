import { createFileRoute } from '@tanstack/react-router'
import Hero from '../pages/landing/hero'
import BestsellingProducts from '../pages/landing/BestsellingProducts'
import SkincareQuizHero from '../pages/landing/SkincareQuizHero'
import ArticleSection from '../pages/landing/ArticleSection'
import CommunitySubscription from '../pages/landing/CommunitySubscription'
import MobileLanding from '../pages/landing/MobileLanding'
import { useIsMobile } from '../lib/hooks/use-mobile'

export const Route = createFileRoute('/')({
  component: Index
})

function Index() {
  const isMobile = useIsMobile()

  // Render mobile-optimized landing page for mobile devices
  if (isMobile) {
    return <MobileLanding />
  }

  // Desktop experience
  return (
    <>
      <Hero />
      <BestsellingProducts />
      <SkincareQuizHero />
      <ArticleSection />
      <CommunitySubscription />
    </>
  )
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      parentRoute: typeof import('./__root').Route
    }
    '/journal': {
      parentRoute: typeof import('./__root').Route
    }
    '/shop': {
      parentRoute: typeof import('./__root').Route
    }
    '/blog': {
      parentRoute: typeof import('./__root').Route
    }
    '/collections': {
      parentRoute: typeof import('./__root').Route
    }
    '/about': {
      parentRoute: typeof import('./__root').Route
    }
  }
}
