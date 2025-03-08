/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useContext } from 'react'
import { CosmeticResponse } from '@/lib/types/Cosmetic'

interface CosmeticContextType {
  filteredCosmetics: CosmeticResponse[]
  isLoading: boolean
  error: Error | null
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
}

const CosmeticContext = createContext<CosmeticContextType>({
  filteredCosmetics: [],
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  onPageChange: () => {}
})

export const CosmeticProvider: React.FC<{
  children: React.ReactNode
  value: CosmeticContextType
}> = ({ children, value }) => {
  return (
    <CosmeticContext.Provider value={value}>
      {children}
    </CosmeticContext.Provider>
  )
}

export const useCosmetic = () => useContext(CosmeticContext)
