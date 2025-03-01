import { createContext, useContext, ReactNode, useCallback } from 'react';

interface BreadcrumbContextType {
  updateBreadcrumb: (...items: string[]) => void;
}

export const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

interface BreadcrumbProviderProps {
  children: ReactNode;
  onUpdate: (...items: string[]) => void;
}

export function BreadcrumbProvider({ children, onUpdate }: BreadcrumbProviderProps) {
  const memoizedUpdate = useCallback((...items: string[]) => {
    onUpdate(...items);
  }, [onUpdate]);

  return (
    <BreadcrumbContext.Provider value={{ updateBreadcrumb: memoizedUpdate }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
}; 