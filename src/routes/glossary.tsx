import { createFileRoute } from '@tanstack/react-router'
import GlossaryPage from '../pages/glossary/GlossaryPage'
export const Route = createFileRoute('/glossary')({
  component: RouteComponent
})

function RouteComponent() {
  return (
    <>
      <GlossaryPage />
    </>
  )
}
