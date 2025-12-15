'use client'

import { useState, useEffect, useCallback } from 'react'
import { IndustryKey, defaultIndustry, isValidIndustryKey } from '@/lib/industry-content'

const STORAGE_KEY = 'flowforge-industry-preference'

export function useIndustryPreference() {
  const [industry, setIndustryState] = useState<IndustryKey>(defaultIndustry)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load preference from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && isValidIndustryKey(stored)) {
        setIndustryState(stored)
      }
    } catch (error) {
      // localStorage might not be available (private browsing, etc.)
      console.warn('Could not read industry preference from localStorage:', error)
    }

    setIsLoaded(true)
  }, [])

  // Set industry and persist to localStorage
  const setIndustry = useCallback((newIndustry: IndustryKey) => {
    setIndustryState(newIndustry)

    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, newIndustry)
    } catch (error) {
      console.warn('Could not save industry preference to localStorage:', error)
    }
  }, [])

  // Clear preference
  const clearPreference = useCallback(() => {
    setIndustryState(defaultIndustry)

    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Could not clear industry preference from localStorage:', error)
    }
  }, [])

  return {
    industry,
    setIndustry,
    clearPreference,
    isLoaded
  }
}
