import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from './lib/context/AuthContext'
import { Toaster } from 'sonner'
import './index.css'
//import CanvasCursor from './components/CanvasCursor'
import ChatwootManager from './components/ChatwootManager'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { DeliveryProvider } from './lib/context/DeliveryContext'

// Create a new router instance
const router = createRouter({ routeTree })

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 // 1 hour
    }
  }
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DeliveryProvider>
          <main>
            <RouterProvider router={router} />
          </main>
          <Toaster position="bottom-right" richColors />
          {/* <CanvasCursor /> */}
          <ChatwootManager />
        </DeliveryProvider>
      </AuthProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  )
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<App />)
}
