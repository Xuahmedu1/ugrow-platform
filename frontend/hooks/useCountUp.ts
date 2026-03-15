import { useState, useEffect, useRef } from 'react'

interface UseCountUpOptions {
  start?: number
  end: number
  duration?: number
  decimals?: number
  delay?: number
}

export function useCountUp({
  start = 0,
  end,
  duration = 1200,
  decimals = 0,
  delay = 0
}: UseCountUpOptions) {
  const [value, setValue] = useState(start)
  const [isComplete, setIsComplete] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // Reset on new end value
    setValue(start)
    setIsComplete(false)
    startTimeRef.current = null

    const timeout = setTimeout(() => {
      const animate = (currentTime: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = currentTime
        }

        const elapsed = currentTime - startTimeRef.current
        const progress = Math.min(elapsed / duration, 1)

        // Easing function (ease-out cubic)
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        
        const currentValue = start + (end - start) * easeOutCubic
        setValue(currentValue)

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate)
        } else {
          setValue(end)
          setIsComplete(true)
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timeout)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [start, end, duration, delay])

  const formattedValue = decimals > 0 
    ? value.toFixed(decimals)
    : Math.round(value).toString()

  return { value, formattedValue, isComplete }
}
