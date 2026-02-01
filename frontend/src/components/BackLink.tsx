'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackLinkProps {
  href?: string
  label?: string
}

export default function BackLink({ href = '/learn', label = 'Back to Learn' }: BackLinkProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(href)
    }
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="text-gray-500 text-sm font-normal hover:text-gray-700 transition-colors inline-block mb-5"
    >
      <span className="inline-flex items-center gap-1.5">
        <ArrowLeft className="w-3.5 h-3.5" />
        {label}
      </span>
    </Link>
  )
}
