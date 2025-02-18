import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/journal')({
  component: JournalPage
})

function JournalPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Journal</h1>
      {/* Add your journal page content here */}
    </div>
  )
}
