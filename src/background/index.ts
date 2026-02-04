import { DEFAULT_SETTINGS, type Settings } from '../types/settings'

// Register event listeners synchronously at top level (required for service workers)
chrome.runtime.onInstalled.addListener(async () => {
  // Initialize settings on install
  const existing = await chrome.storage.sync.get('settings')
  if (!existing.settings) {
    await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS })
  }
})

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_SETTINGS') {
    chrome.storage.sync.get('settings').then((result) => {
      const settings = { ...DEFAULT_SETTINGS, ...(result.settings as Partial<Settings>) }
      sendResponse(settings)
    })
    return true // Required for async response
  }

  if (message.type === 'UPDATE_SETTINGS') {
    chrome.storage.sync.get('settings').then(async (result) => {
      const currentSettings = { ...DEFAULT_SETTINGS, ...(result.settings as Partial<Settings>) }
      const newSettings = { ...currentSettings, ...message.payload }
      await chrome.storage.sync.set({ settings: newSettings })
      sendResponse(newSettings)
    })
    return true
  }

  return false
})

// Log that extension is loaded (helpful for debugging)
console.log('Amazon Mopper service worker loaded')
