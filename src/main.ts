import './styles.css'

import { mountBasic } from './calculators/basic'
import { createLayout } from './ui/layout'
import { NAV_ITEMS } from './ui/nav'

const app = document.getElementById('app')

if (!app) {
  throw new Error('Root #app element not found')
}

const { content, setActiveNav, closeMobileNav } = createLayout(app, (id) => {
  window.location.hash = `#${id}`
})

const knownRoutes = NAV_ITEMS.map((item) => item.id)

function getRoute(): string {
  const hash = window.location.hash.replace('#', '') || 'basic'
  if (knownRoutes.includes(hash)) return hash
  return 'basic'
}

async function router() {
  const route = getRoute()
  content.innerHTML = ''
  setActiveNav(route)

  if (route === 'basic') {
    mountBasic(content)
  } else if (route === 'loan') {
    const module = await import('./calculators/loan')
    module.mount(content)
  } else if (route === 'currency') {
    const module = await import('./calculators/currency')
    module.mount(content)
  } else if (route === 'roi') {
    const module = await import('./calculators/roi')
    module.mount(content)
  } else {
    mountBasic(content)
  }

  closeMobileNav()
  content.focus()
}

window.addEventListener('hashchange', router)
router()

