declare module 'sonner' {
  export const toast: {
    success: (message: string, options?: { action?: { label: string; onClick: () => void } }) => void
    error: (message: string, options?: { action?: { label: string; onClick: () => void } }) => void
    info: (message: string, options?: { action?: { label: string; onClick: () => void } }) => void
    warning: (message: string, options?: { action?: { label: string; onClick: () => void } }) => void
  }
  
  export interface ToasterProps {
    theme?: 'light' | 'dark' | 'system'
    className?: string
    style?: React.CSSProperties
  }
  
  export const Toaster: React.ComponentType<ToasterProps>
}

