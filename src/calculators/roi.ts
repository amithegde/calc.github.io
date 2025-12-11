import { calculateRoi, formatCurrency, parseDecimal } from '../lib/decimal-utils'

export function mount(container: HTMLElement) {
  const card = document.createElement('div')
  card.className = 'glass-panel p-6 max-w-3xl mx-auto'
  card.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <div>
        <p class="text-sm text-gray-500">Return on investment and annualized growth</p>
        <h2 class="text-xl font-semibold text-gray-900">ROI calculator</h2>
      </div>
      <span class="text-xs font-semibold uppercase text-brand-700 bg-brand-50 px-2 py-1 rounded-full">Investment</span>
    </div>
    <form id="roi-form" class="space-y-4" novalidate>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="input-label" for="initial">Initial amount</label>
          <input id="initial" name="initial" type="text" inputmode="decimal" pattern="[0-9.,-]*" class="input-field" placeholder="10000" required />
        </div>
        <div>
          <label class="input-label" for="final">Final amount</label>
          <input id="final" name="final" type="text" inputmode="decimal" pattern="[0-9.,-]*" class="input-field" placeholder="15000" required />
        </div>
        <div>
          <label class="input-label" for="years">Years</label>
          <input id="years" name="years" type="text" inputmode="decimal" pattern="[0-9.,-]*" class="input-field" placeholder="3" required />
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button type="submit" class="btn-primary">Calculate ROI</button>
        <p class="text-xs text-gray-500">Annualized return uses CAGR.</p>
      </div>
      <div id="roi-error" class="hidden rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert"></div>
      <dl id="roi-results" class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm"></dl>
    </form>
  `

  const form = card.querySelector('#roi-form') as HTMLFormElement
  const errorBox = card.querySelector('#roi-error') as HTMLDivElement
  const results = card.querySelector('#roi-results') as HTMLDListElement

  const showError = (message: string) => {
    errorBox.textContent = message
    errorBox.classList.remove('hidden')
  }

  const clearError = () => {
    errorBox.textContent = ''
    errorBox.classList.add('hidden')
  }

  const renderResults = (total: string, percent: string, annualized: string) => {
    results.innerHTML = `
      <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <dt class="text-xs uppercase text-gray-500">Total gain</dt>
        <dd class="text-lg font-semibold text-brand-700">${total}</dd>
      </div>
      <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <dt class="text-xs uppercase text-gray-500">ROI</dt>
        <dd class="text-lg font-semibold text-gray-800">${percent}</dd>
      </div>
      <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <dt class="text-xs uppercase text-gray-500">Annualized</dt>
        <dd class="text-lg font-semibold text-gray-800">${annualized}</dd>
      </div>
    `
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    clearError()

    const initial = parseDecimal((form.querySelector('#initial') as HTMLInputElement).value)
    const finalAmount = parseDecimal((form.querySelector('#final') as HTMLInputElement).value)
    const years = parseDecimal((form.querySelector('#years') as HTMLInputElement).value)

    if (!initial || initial.lte(0)) {
      showError('Initial amount must be greater than zero.')
      return
    }

    if (!finalAmount || finalAmount.lte(0)) {
      showError('Final amount must be greater than zero.')
      return
    }

    if (!years || years.lte(0)) {
      showError('Years must be greater than zero.')
      return
    }

    try {
      const { totalReturn, annualized } = calculateRoi(initial, finalAmount, years)
      const gain = finalAmount.minus(initial)
      const roiPercent = totalReturn.mul(100).toDecimalPlaces(2).toString() + '%'
      const annualizedPercent = annualized
        ? annualized.mul(100).toDecimalPlaces(2).toString() + '%'
        : '–'

      renderResults(formatCurrency(gain), roiPercent, annualizedPercent)
    } catch (error) {
      showError((error as Error).message)
    }
  })

  container.appendChild(card)
}

