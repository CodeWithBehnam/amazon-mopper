import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'Amazon Mopper',
  description: 'Enhance your Amazon shopping experience with discount badges, best value indicators, and delivery countdowns',
  version: '1.0.0',
  icons: {
    '16': 'public/icons/icon16.png',
    '48': 'public/icons/icon48.png',
    '128': 'public/icons/icon128.png',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      '16': 'public/icons/icon16.png',
      '48': 'public/icons/icon48.png',
    },
  },
  permissions: ['storage'],
  host_permissions: ['*://*.amazon.*/*'],
  content_scripts: [
    {
      matches: ['*://*.amazon.*/*'],
      js: ['src/content/index.tsx'],
      run_at: 'document_idle',
    },
  ],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
})
