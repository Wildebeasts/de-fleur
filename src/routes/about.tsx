import AboutLayout from '@/pages/about/AboutLayout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: AboutPage
})

function AboutPage() {
  return (
    <>
      <AboutLayout />
    </>
  )
}
