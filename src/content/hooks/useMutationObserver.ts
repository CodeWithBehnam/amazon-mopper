import { useEffect, useRef, useCallback } from 'react'
import { debounce } from '../lib/debounce'
import { findProducts, isProductElement } from '../lib/selectors'

const PROCESSED_MARKER = 'data-mopper-processed'
const DEBOUNCE_DELAY = 100 // ms

export interface UseMutationObserverOptions {
  onProductsFound: (products: HTMLElement[]) => void
  enabled?: boolean
}

/**
 * Custom hook to observe DOM mutations and find new product elements
 */
export function useMutationObserver({
  onProductsFound,
  enabled = true,
}: UseMutationObserverOptions) {
  const observerRef = useRef<MutationObserver | null>(null)
  const callbackRef = useRef(onProductsFound)

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = onProductsFound
  }, [onProductsFound])

  // Find unprocessed products
  const findUnprocessedProducts = useCallback((): HTMLElement[] => {
    const allProducts = findProducts()
    return allProducts.filter((el) => !el.hasAttribute(PROCESSED_MARKER))
  }, [])

  // Mark products as processed
  const markProductsProcessed = useCallback((products: HTMLElement[]) => {
    products.forEach((el) => el.setAttribute(PROCESSED_MARKER, 'true'))
  }, [])

  // Process mutations with debouncing
  const processChanges = useCallback(
    debounce(() => {
      const newProducts = findUnprocessedProducts()
      if (newProducts.length > 0) {
        markProductsProcessed(newProducts)
        callbackRef.current(newProducts)
      }
    }, DEBOUNCE_DELAY),
    [findUnprocessedProducts, markProductsProcessed]
  )

  // Set up mutation observer
  useEffect(() => {
    if (!enabled) {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
      return
    }

    // Initial scan for products
    const initialProducts = findUnprocessedProducts()
    if (initialProducts.length > 0) {
      markProductsProcessed(initialProducts)
      callbackRef.current(initialProducts)
    }

    // Create mutation observer
    const observer = new MutationObserver((mutations) => {
      // Check if any mutation added nodes that might be products
      let hasRelevantChanges = false

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement) {
              // Check if the node itself is a product or contains products
              if (isProductElement(node) || node.querySelector('[data-asin]')) {
                hasRelevantChanges = true
                break
              }
            }
          }
        }
        if (hasRelevantChanges) break
      }

      if (hasRelevantChanges) {
        processChanges()
      }
    })

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    observerRef.current = observer

    return () => {
      observer.disconnect()
      observerRef.current = null
    }
  }, [enabled, findUnprocessedProducts, markProductsProcessed, processChanges])

  // Manual scan function for forcing a re-check
  const scan = useCallback(() => {
    const newProducts = findUnprocessedProducts()
    if (newProducts.length > 0) {
      markProductsProcessed(newProducts)
      callbackRef.current(newProducts)
    }
  }, [findUnprocessedProducts, markProductsProcessed])

  return { scan }
}
