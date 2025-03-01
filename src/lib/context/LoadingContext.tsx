/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import React, { createContext, useContext, useState } from 'react'

interface LoadingContextType {
  startLoading: () => void
  stopLoading: () => void
}

const LoadingContext = createContext<LoadingContextType>({
  startLoading: () => { },
  stopLoading: () => { }
})

export const useLoading = () => useContext(LoadingContext)

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [loading, setLoading] = useState(false)

  const startLoading = () => setLoading(true)
  const stopLoading = () => setLoading(false)

  return (
    <LoadingContext.Provider value={{ startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}
