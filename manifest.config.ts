import { defineManifest } from '@crxjs/vite-plugin'

// All major Amazon marketplace domains
const AMAZON_DOMAINS = [
  '*://*.amazon.com/*',
  '*://*.amazon.co.uk/*',
  '*://*.amazon.de/*',
  '*://*.amazon.fr/*',
  '*://*.amazon.it/*',
  '*://*.amazon.es/*',
  '*://*.amazon.ca/*',
  '*://*.amazon.com.mx/*',
  '*://*.amazon.com.br/*',
  '*://*.amazon.co.jp/*',
  '*://*.amazon.in/*',
  '*://*.amazon.cn/*',
  '*://*.amazon.com.au/*',
  '*://*.amazon.nl/*',
  '*://*.amazon.sg/*',
  '*://*.amazon.ae/*',
  '*://*.amazon.sa/*',
  '*://*.amazon.se/*',
  '*://*.amazon.pl/*',
  '*://*.amazon.com.tr/*',
  '*://*.amazon.eg/*',
]

export default defineManifest({
  manifest_version: 3,
  name: 'Amazon Mopper',
  description: 'Enhance your Amazon shopping experience with discount badges, best value indicators, and delivery countdowns',
  version: '1.0.2',
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
  host_permissions: AMAZON_DOMAINS,
  content_scripts: [
    {
      matches: AMAZON_DOMAINS,
      js: ['src/content/index.tsx'],
      run_at: 'document_idle',
    },
  ],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
})
