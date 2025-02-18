import { createFileRoute } from '@tanstack/react-router'
import Hero from '../pages/landing/hero'
import BestsellingProducts from '../pages/landing/BestsellingProducts'
import SkincareQuizHero from 'pages/landing/SkincareQuizHero'
import ArticleSection from 'pages/landing/ArticleSection'
import CommunitySubscription from 'pages/landing/CommunitySubscription'

export const Route = createFileRoute('/')({
  component: Index
})

function Index() {
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
