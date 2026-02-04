import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useSettings } from './hooks/useSettings'
import { useMutationObserver } from './hooks/useMutationObserver'
import { extractProductData, type ProductData } from './lib/parsers'
import {
  calculateDiscount,
  calculateDaysUntil,
  findBestValueIndices,
  formatRoundedPrice,
  truncateText,
} from './lib/calculators'
import {
  querySelector,
  PRIME_SELECTORS,
  IMAGE_CONTAINER_SELECTORS,
  DELIVERY_SELECTORS,
  TITLE_SELECTORS,
} from './lib/selectors'
import { DiscountBadge } from './components/DiscountBadge'
import { BestValueBadge, applyBestValueBorder, removeBestValueBorder } from './components/BestValueBorder'
import { DeliveryCountdown } from './components/DeliveryCountdown'

interface ProductBadgeState {
  element: HTMLElement
  data: ProductData
  badgeContainer: HTMLElement
  discountPercent: number | null
  daysUntilDelivery: number | null
  isBestValue: boolean
}

interface AppProps {
  shadowRoot: ShadowRoot
}

export function App({ shadowRoot }: AppProps) {
  const { settings, loading } = useSettings()
  const [productStates, setProductStates] = useState<Map<HTMLElement, ProductBadgeState>>(new Map())

  // Process products when found by MutationObserver
  const processProducts = useCallback(
    (products: HTMLElement[]) => {
      if (loading) return

      setProductStates((prev) => {
        const newStates = new Map(prev)

        for (const productEl of products) {
          // Skip if already processed
          if (newStates.has(productEl)) continue

          // Extract product data
          const data = extractProductData(productEl)

          // Calculate discount
          let discountPercent: number | null = null
          if (data.currentPrice && data.wasPrice) {
            discountPercent = calculateDiscount(data.currentPrice, data.wasPrice)
          }

          // Calculate days until delivery
          let daysUntilDelivery: number | null = null
          if (data.deliveryDate) {
            daysUntilDelivery = calculateDaysUntil(data.deliveryDate)
            // Don't show past dates or too far in the future
            if (daysUntilDelivery < 0 || daysUntilDelivery > 30) {
              daysUntilDelivery = null
            }
          }

          // Create badge container
          const badgeContainer = document.createElement('div')
          badgeContainer.className = 'mopper-badge-container'
          badgeContainer.style.cssText = 'position: absolute; top: 0; left: 0; z-index: 100; pointer-events: none;'

          // Find image container to position badges
          const imageContainer = querySelector(productEl, IMAGE_CONTAINER_SELECTORS)
          if (imageContainer && imageContainer instanceof HTMLElement) {
            // Make container relative for absolute positioning
            const computedStyle = window.getComputedStyle(imageContainer)
            if (computedStyle.position === 'static') {
              imageContainer.style.position = 'relative'
            }
            imageContainer.appendChild(badgeContainer)
          } else {
            // Fallback: append to product element itself
            productEl.style.position = 'relative'
            productEl.appendChild(badgeContainer)
          }

          newStates.set(productEl, {
            element: productEl,
            data,
            badgeContainer,
            discountPercent,
            daysUntilDelivery,
            isBestValue: false,
          })
        }

        return newStates
      })
    },
    [loading]
  )

  // Start observing DOM for products
  useMutationObserver({
    onProductsFound: processProducts,
    enabled: !loading,
  })

  // Calculate best value products
  useEffect(() => {
    if (!settings.showBestValueBorder || productStates.size === 0) return

    // Get prices for comparison (prefer price-per-unit, fallback to current price)
    const products = Array.from(productStates.values())
    const prices = products.map((p) => p.data.pricePerUnit ?? p.data.currentPrice)

    // Find best value indices
    const bestIndices = new Set(findBestValueIndices(prices))

    // Update states
    setProductStates((prev) => {
      const newStates = new Map(prev)
      let changed = false

      products.forEach((product, index) => {
        const isBestValue = bestIndices.has(index)
        const current = newStates.get(product.element)
        if (current && current.isBestValue !== isBestValue) {
          newStates.set(product.element, { ...current, isBestValue })
          changed = true

          // Apply or remove border
          if (isBestValue) {
            applyBestValueBorder(product.element)
          } else {
            removeBestValueBorder(product.element)
          }
        }
      })

      return changed ? newStates : prev
    })
  }, [productStates.size, settings.showBestValueBorder])

  // Apply non-badge modifications (price rounding, Prime removal, title truncation)
  useEffect(() => {
    productStates.forEach((state) => {
      const { element, data } = state

      // Hide Prime icons
      if (settings.hidePrimeIcons) {
        PRIME_SELECTORS.forEach((selector) => {
          element.querySelectorAll(selector).forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.display = 'none'
            }
          })
        })
      }

      // Round prices - target only the main price, not RRP/Was prices
      if (settings.roundPrices && data.currentPrice && !element.dataset.mopperPriceRounded) {
        element.dataset.mopperPriceRounded = 'true'
        const roundedText = formatRoundedPrice(data.currentPrice, data.currency)

        // Find the main price container (not struck-through RRP prices)
        const mainPriceContainer = element.querySelector('.a-price:not([data-a-strike="true"])')
        if (mainPriceContainer && !mainPriceContainer.querySelector('.mopper-rounded-price')) {
          const roundedSpan = document.createElement('span')
          roundedSpan.className = 'mopper-rounded-price'
          roundedSpan.style.cssText = 'margin-left: 8px; font-weight: bold; color: #B12704; font-size: 1.1em;'
          roundedSpan.textContent = roundedText
          mainPriceContainer.parentElement?.insertBefore(roundedSpan, mainPriceContainer.nextSibling)
        }
      }

      // Truncate titles
      if (settings.truncateTitles && data.title && data.title.length > 50) {
        const titleEl = querySelector(element, TITLE_SELECTORS)
        if (titleEl instanceof HTMLElement && !element.dataset.mopperTitleTruncated) {
          element.dataset.mopperTitleTruncated = 'true'
          const truncated = truncateText(data.title, 50)
          titleEl.title = data.title // Full title on hover
          titleEl.textContent = truncated
        }
      }

      // Append delivery countdown to delivery text
      if (settings.showDeliveryCountdown && state.daysUntilDelivery !== null) {
        const deliveryEl = querySelector(element, DELIVERY_SELECTORS)
        if (deliveryEl instanceof HTMLElement && !element.dataset.mopperDeliveryAdded) {
          element.dataset.mopperDeliveryAdded = 'true'
          // Create a container for the countdown badge
          const countdownContainer = document.createElement('span')
          countdownContainer.className = 'mopper-delivery-countdown'
          deliveryEl.appendChild(countdownContainer)
        }
      }
    })
  }, [productStates, settings])

  // Render badges using portals
  const badges = Array.from(productStates.values()).flatMap((state) => {
    const portals: React.ReactNode[] = []
    const { badgeContainer, discountPercent, isBestValue, daysUntilDelivery, element } = state

    // Discount badge
    if (settings.showDiscountBadge && discountPercent !== null) {
      const discountWrapper = document.createElement('div')
      discountWrapper.style.marginBottom = '2px'
      if (!badgeContainer.querySelector('.discount-badge-wrapper')) {
        discountWrapper.className = 'discount-badge-wrapper'
        badgeContainer.appendChild(discountWrapper)
      }
      const target = badgeContainer.querySelector('.discount-badge-wrapper')
      if (target) {
        portals.push(
          createPortal(
            <DiscountBadge discountPercent={discountPercent} />,
            target,
            `discount-${element.dataset.asin || Math.random()}`
          )
        )
      }
    }

    // Best value badge
    if (settings.showBestValueBorder && isBestValue) {
      const bestValueWrapper = document.createElement('div')
      bestValueWrapper.style.marginBottom = '2px'
      if (!badgeContainer.querySelector('.best-value-badge-wrapper')) {
        bestValueWrapper.className = 'best-value-badge-wrapper'
        badgeContainer.appendChild(bestValueWrapper)
      }
      const target = badgeContainer.querySelector('.best-value-badge-wrapper')
      if (target) {
        portals.push(
          createPortal(
            <BestValueBadge />,
            target,
            `bestvalue-${element.dataset.asin || Math.random()}`
          )
        )
      }
    }

    // Delivery countdown (rendered inline with delivery text)
    if (settings.showDeliveryCountdown && daysUntilDelivery !== null) {
      const deliveryTarget = element.querySelector('.mopper-delivery-countdown')
      if (deliveryTarget) {
        portals.push(
          createPortal(
            <DeliveryCountdown days={daysUntilDelivery} />,
            deliveryTarget,
            `delivery-${element.dataset.asin || Math.random()}`
          )
        )
      }
    }

    return portals
  })

  if (loading) return null

  return <>{badges}</>
}
