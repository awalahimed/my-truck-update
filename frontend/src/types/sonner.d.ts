declare module 'sonner' {
  export interface ToastOptions {
    description?: React.ReactNode
    action?: { label: string; onClick: () => void }
    cancel?: { label: string; onClick: () => void }
    loading?: React.ReactNode
    success?: React.ReactNode | ((data: any) => React.ReactNode)
    error?: React.ReactNode | ((error: any) => React.ReactNode)
    duration?: number
    [key: string]: any
  }

  export interface ToastFunction {
    (message: string | React.ReactNode, options?: ToastOptions): string | number
    success: (message: string | React.ReactNode, options?: ToastOptions) => string | number
    error: (message: string | React.ReactNode, options?: ToastOptions) => string | number
    info: (message: string | React.ReactNode, options?: ToastOptions) => string | number
    warning: (message: string | React.ReactNode, options?: ToastOptions) => string | number
    promise: <T>(promise: Promise<T> | (() => Promise<T>), options?: ToastOptions) => string | number
    dismiss: (id?: string | number) => void
    [key: string]: any
  }

  export const toast: ToastFunction
  
  export interface ToasterProps {
    theme?: 'light' | 'dark' | 'system'
    className?: string
    style?: React.CSSProperties
    position?: string
    richColors?: boolean
    closeButton?: boolean
    [key: string]: any
  }
  
  export const Toaster: React.ComponentType<ToasterProps>
}


