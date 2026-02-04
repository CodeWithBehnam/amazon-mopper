import { useState, useEffect } from 'react'
import {
  DEFAULT_SETTINGS,
  SETTING_LABELS,
  SETTING_DESCRIPTIONS,
  type Settings,
} from '../types/settings'

export function Popup() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    chrome.storage.sync.get('settings').then((result) => {
      if (result.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...result.settings })
      }
      setLoading(false)
    })
  }, [])

  const handleToggle = async (key: keyof Settings) => {
    const newSettings = { ...settings, [key]: !settings[key] }
    setSettings(newSettings)
    await chrome.storage.sync.set({ settings: newSettings })
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <span>Loading...</span>
      </div>
    )
  }

  const settingKeys = Object.keys(DEFAULT_SETTINGS) as Array<keyof Settings>

  return (
    <div>
      <div className="header">
        <h1>Amazon Mopper</h1>
        <p>Configure your shopping enhancements</p>
      </div>

      <div>
        {settingKeys.map((key) => (
          <div key={key} className="toggle-container">
            <div>
              <div className="toggle-label">{SETTING_LABELS[key]}</div>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                {SETTING_DESCRIPTIONS[key]}
              </div>
            </div>
            <button
              type="button"
              className={`toggle-switch ${settings[key] ? 'active' : ''}`}
              onClick={() => handleToggle(key)}
              aria-label={`Toggle ${SETTING_LABELS[key]}`}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '12px 16px',
          borderTop: '2px solid #000',
          fontSize: '10px',
          color: '#666',
          textAlign: 'center',
        }}
      >
        Changes apply immediately
      </div>
    </div>
  )
}
