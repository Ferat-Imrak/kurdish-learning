'use client'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`container mx-auto px-4 py-6 max-w-5xl ${className}`}>
      {children}
    </div>
  )
}
