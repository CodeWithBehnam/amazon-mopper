import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
// Import CSS as inline string for Shadow DOM injection
import styles from './styles.css?inline'

// Create shadow host element
const shadowHost = document.createElement('amazon-mopper-root')
shadowHost.style.cssText = 'all: initial; position: fixed; z-index: 2147483647; pointer-events: none;'
document.body.appendChild(shadowHost)

// Attach shadow DOM
const shadowRoot = shadowHost.attachShadow({ mode: 'open' })

// Inject styles into shadow DOM
const styleElement = document.createElement('style')
styleElement.textContent = styles
shadowRoot.appendChild(styleElement)

// Create app container inside shadow DOM
const appContainer = document.createElement('div')
appContainer.id = 'mopper-app'
shadowRoot.appendChild(appContainer)

// Render React app inside shadow DOM
createRoot(appContainer).render(
  <StrictMode>
    <App shadowRoot={shadowRoot} />
  </StrictMode>
)

console.log('Amazon Mopper content script loaded')
