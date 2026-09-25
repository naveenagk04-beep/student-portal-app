import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    // Subscribe first, then sync initial value asynchronously so we don't
    // call setState synchronously inside the effect body.
    const raf = requestAnimationFrame(() => onChange())
    return () => {
      cancelAnimationFrame(raf)
      mql.removeEventListener("change", onChange)
    }
  }, [])

  return !!isMobile
}
