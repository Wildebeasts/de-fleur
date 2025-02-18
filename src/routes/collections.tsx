import { createFileRoute } from '@tanstack/react-router'
import CollectionsLayout from '@/pages/collections/CollectionsLayout'

export const Route = createFileRoute('/collections')({
  component: CollectionsPage
})

function CollectionsPage() {
  return (
    <>
      <CollectionsLayout />
    </>
  )
}
