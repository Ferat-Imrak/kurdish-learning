'use client'

import { useState, useEffect } from 'react'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      // Check window width (mobile-first: < 768px)
      const isMobileWidth = window.innerWidth < 768
      
      // Also check user agent for mobile devices
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      
      setIsMobile(isMobileWidth || isMobileUA)
    }

    // Check on mount
    checkMobile()

    // Listen for resize events
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return isMobile
}

