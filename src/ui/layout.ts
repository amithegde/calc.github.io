import { createNav, NAV_ITEMS } from './nav'

type LayoutResult = {
  content: HTMLElement
  setActiveNav: (id: string) => void
  closeMobileNav: () => void
  toggleNav: () => void
}

export function createLayout(root: HTMLElement, onNavigate: (id: string) => void): LayoutResult {
  root.innerHTML = ''

  const shell = document.createElement('div')
  shell.className = 'min-h-screen bg-gray-50 flex flex-col md:flex-row'

  const topBar = document.createElement('header')
  topBar.className =
    'md:hidden sticky top-0 z-20 flex items-center justify-between bg-white px-4 py-3 shadow-sm border-b border-gray-200'

  const brand = document.createElement('div')
  brand.className = 'flex items-center gap-2 text-lg font-semibold text-gray-900'
  brand.innerHTML = `<img class="h-7 w-7" src="/logo-icon.svg" alt="Calc logo" /><span>Calc Suite</span>`

  const toggleBtn = document.createElement('button')
  toggleBtn.type = 'button'
  toggleBtn.className =
    'inline-flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-200'
  toggleBtn.setAttribute('aria-label', 'Toggle navigation menu')
  toggleBtn.setAttribute('aria-expanded', 'false')
  toggleBtn.innerHTML = `
    <span class="sr-only">Open menu</span>
    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fill-rule="evenodd" d="M3 5h14v1.5H3V5zm0 4.25h14v1.5H3v-1.5zM3 13.5h14V15H3v-1.5z" clip-rule="evenodd" />
    </svg>
  `

  topBar.append(brand, toggleBtn)

  const { element: nav, setActive, closeMobile, openMobile } = createNav((id) => {
    onNavigate(id)
    closeMobile()
    toggleBtn.setAttribute('aria-expanded', 'false')
  })

  const navContainer = document.createElement('div')
  navContainer.className = 'md:w-64 md:flex-shrink-0 md:border-r md:border-gray-200 md:block hidden bg-white'
  navContainer.appendChild(nav)

  const content = document.createElement('main')
  content.className = 'flex-1 p-4 md:p-8'
  content.setAttribute('role', 'main')
  content.setAttribute('tabindex', '-1')

  const updateNavVisibility = () => {
    if (window.innerWidth >= 768) {
      navContainer.classList.remove('hidden')
      openMobile()
      toggleBtn.setAttribute('aria-expanded', 'true')
    } else {
      navContainer.classList.add('hidden')
      closeMobile()
      toggleBtn.setAttribute('aria-expanded', 'false')
    }
  }

  toggleBtn.addEventListener('click', () => {
    const isHidden = nav.classList.contains('hidden')
    if (isHidden) {
      navContainer.classList.remove('hidden')
      openMobile()
      toggleBtn.setAttribute('aria-expanded', 'true')
    } else {
      closeMobile()
      navContainer.classList.add('hidden')
      toggleBtn.setAttribute('aria-expanded', 'false')
    }
  })

  window.addEventListener('resize', updateNavVisibility)
  updateNavVisibility()

  const navHint = document.createElement('div')
  navHint.className =
    'md:hidden bg-brand-50 text-brand-800 border border-brand-100 rounded-lg px-4 py-3 mt-2 mx-4 text-sm'
  navHint.textContent = 'Use the menu to switch calculators.'

  shell.append(topBar, navContainer, content)
  root.append(navHint, shell)

  return {
    content,
    setActiveNav: (id: string) => {
      const exists = NAV_ITEMS.some((item) => item.id === id)
      if (exists) {
        setActive(id)
      }
    },
    closeMobileNav: () => {
      if (window.innerWidth < 768) {
        closeMobile()
        navContainer.classList.add('hidden')
        toggleBtn.setAttribute('aria-expanded', 'false')
      }
    },
    toggleNav: () => toggleBtn.click()
  }
}

