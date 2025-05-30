
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Check user agent for specific iOS devices that might report incorrect viewport
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isIOSSafari = isIOS && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    
    // iPhone 15 Pro and similar modern iPhones
    const isModernIPhone = isIOS && (
      window.screen.width <= 430 || // iPhone 15 Pro Max width
      window.innerWidth <= 430 ||
      window.devicePixelRatio >= 3
    )
    
    // Force mobile detection for iOS devices with smaller screens
    if (isModernIPhone || (isIOS && window.innerWidth <= MOBILE_BREAKPOINT)) {
      setIsMobile(true)
    } else {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    mql.addEventListener("change", onChange)
    onChange()

    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
