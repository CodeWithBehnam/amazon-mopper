import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_SETTINGS, type Settings } from '../../types/settings'

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  // Load settings on mount
  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response: Settings) => {
      if (response) {
        setSettings(response)
      }
      setLoading(false)
    })
  }, [])

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'sync' && changes.settings?.newValue) {
        setSettings({ ...DEFAULT_SETTINGS, ...changes.settings.newValue })
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [])

  // Update a single setting
  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', payload: { [key]: value } })
  }, [settings])

  // Update multiple settings
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', payload: updates })
  }, [settings])

  return {
    settings,
    loading,
    updateSetting,
    updateSettings,
  }
}
