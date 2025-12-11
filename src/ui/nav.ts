type NavItem = {
  id: string
  label: string
  description?: string
  disabled?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'basic', label: 'Basic', description: 'Quick calculator' },
  { id: 'loan', label: 'Loan', description: 'Monthly payment' },
  { id: 'roi', label: 'ROI', description: 'Investment growth' },
  { id: 'currency', label: 'Currency (soon)', description: 'Placeholder' }
]

export type NavController = {
  element: HTMLElement
  setActive: (id: string) => void
  closeMobile: () => void
  openMobile: () => void
}

export function createNav(onNavigate?: (id: string) => void): NavController {
  const nav = document.createElement('aside')
  nav.className =
    'h-full md:h-auto md:min-h-screen w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200'
  nav.setAttribute('role', 'navigation')
  nav.setAttribute('aria-label', 'Calculator modules')

  const wrapper = document.createElement('div')
  wrapper.className = 'p-4'

  const title = document.createElement('div')
  title.className = 'mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900'
  title.innerHTML = `<span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">≡</span><span>Calc Suite</span>`
  wrapper.appendChild(title)

  const list = document.createElement('ul')
  list.className = 'space-y-1'

  const buttons: HTMLAnchorElement[] = []

  const setActive = (id: string) => {
    buttons.forEach((btn) => {
      const isActive = btn.dataset.id === id
      btn.className = [
        'flex items-start justify-between gap-2 rounded-lg px-3 py-2 text-sm transition',
        isActive
          ? 'bg-brand-50 text-brand-700 border border-brand-100 shadow-sm'
          : 'text-gray-700 hover:bg-gray-100 border border-transparent'
      ].join(' ')
      btn.setAttribute('aria-current', isActive ? 'page' : 'false')
    })
  }

  NAV_ITEMS.forEach((item) => {
    const li = document.createElement('li')
    const link = document.createElement('a')
    link.href = `#${item.id}`
    link.dataset.id = item.id
    link.tabIndex = 0
    link.className =
      'flex items-start justify-between gap-2 rounded-lg px-3 py-2 text-sm transition text-gray-700 hover:bg-gray-100 border border-transparent'
    link.setAttribute('role', 'link')
    link.setAttribute('aria-disabled', item.disabled ? 'true' : 'false')
    link.innerHTML = `
      <span class="flex flex-col">
        <span class="font-semibold">${item.label}</span>
        ${item.description ? `<span class="text-xs text-gray-500">${item.description}</span>` : ''}
      </span>
      ${item.disabled ? '<span class="text-[10px] uppercase text-gray-400 font-semibold">soon</span>' : ''}
    `

    const handleActivate = (event: Event) => {
      if (item.disabled) {
        event.preventDefault()
        return
      }
      onNavigate?.(item.id)
    }

    link.addEventListener('click', handleActivate)
    link.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter' || evt.key === ' ') {
        evt.preventDefault()
        handleActivate(evt)
      }
    })

    li.appendChild(link)
    list.appendChild(li)
    buttons.push(link)
  })

  wrapper.appendChild(list)
  nav.appendChild(wrapper)

  const closeMobile = () => {
    if (window.innerWidth < 768) {
      nav.classList.add('hidden')
    }
  }

  const openMobile = () => {
    nav.classList.remove('hidden')
  }

  return { element: nav, setActive, closeMobile, openMobile }
}

