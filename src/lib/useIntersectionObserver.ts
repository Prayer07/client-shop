import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverProps {
  threshold?: number | number[]
  rootMargin?: string
}

/**
 * Hook to trigger animations when element becomes visible
 * Returns a ref to attach to the element and an `isVisible` state
 */
export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = '0px',
}: UseIntersectionObserverProps = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if element is already visible on mount
    if (ref.current && !isVisible) {
      const rect = ref.current.getBoundingClientRect()
      if (rect.top < window.innerHeight) {
        setIsVisible(true)
      }
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            // Only unobserve if we want one-time animation
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, isVisible])

  return { ref, isVisible }
}
