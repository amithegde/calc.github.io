import { calculateLoanPayment, formatCurrency, parseDecimal } from '../lib/decimal-utils'

export function mount(container: HTMLElement) {
  const card = document.createElement('div')
  card.className = 'glass-panel p-6 max-w-3xl mx-auto'

  card.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <div>
        <p class="text-sm text-gray-500">Estimate monthly payment with interest</p>
        <h2 class="text-xl font-semibold text-gray-900">Loan calculator</h2>
      </div>
      <span class="text-xs font-semibold uppercase text-brand-700 bg-brand-50 px-2 py-1 rounded-full">Finance</span>
    </div>
    <form class="space-y-4" id="loan-form" novalidate>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="input-label" for="principal">Principal</label>
          <input id="principal" name="principal" type="text" inputmode="decimal" pattern="[0-9.,-]*" class="input-field" placeholder="250000" required />
        </div>
        <div>
          <label class="input-label" for="rate">Annual rate (%)</label>
          <input id="rate" name="rate" type="text" inputmode="decimal" pattern="[0-9.,-]*" class="input-field" placeholder="4.5" required />
        </div>
        <div>
          <label class="input-label" for="years">Years</label>
          <input id="years" name="years" type="text" inputmode="decimal" pattern="[0-9.,-]*" class="input-field" placeholder="30" required />
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button type="submit" class="btn-primary">Calculate payment</button>
        <span class="text-xs text-gray-500">Uses amortized monthly payment formula.</span>
      </div>
      <div id="loan-error" class="hidden rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert"></div>
      <dl id="loan-results" class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm"></dl>
    </form>
  `

  const form = card.querySelector('#loan-form') as HTMLFormElement
  const errorBox = card.querySelector('#loan-error') as HTMLDivElement
  const results = card.querySelector('#loan-results') as HTMLDListElement

  const showError = (message: string) => {
    errorBox.textContent = message
    errorBox.classList.remove('hidden')
  }

  const clearError = () => {
    errorBox.textContent = ''
    errorBox.classList.add('hidden')
  }

  const renderResults = (monthly: string, total: string, interest: string) => {
    results.innerHTML = `
      <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <dt class="text-xs uppercase text-gray-500">Monthly payment</dt>
        <dd class="text-lg font-semibold text-brand-700">${monthly}</dd>
      </div>
      <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <dt class="text-xs uppercase text-gray-500">Total repaid</dt>
        <dd class="text-lg font-semibold text-gray-800">${total}</dd>
      </div>
      <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <dt class="text-xs uppercase text-gray-500">Total interest</dt>
        <dd class="text-lg font-semibold text-gray-800">${interest}</dd>
      </div>
    `
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    clearError()

    const principal = parseDecimal((form.querySelector('#principal') as HTMLInputElement).value)
    const rate = parseDecimal((form.querySelector('#rate') as HTMLInputElement).value)
    const years = parseDecimal((form.querySelector('#years') as HTMLInputElement).value)

    if (!principal || principal.lte(0)) {
      showError('Principal must be a positive number.')
      return
    }
    if (!rate || rate.lt(0)) {
      showError('Rate must be zero or positive.')
      return
    }
    if (!years || years.lte(0)) {
      showError('Years must be greater than zero.')
      return
    }

    try {
      const { monthlyPayment, totalPayment, totalInterest } = calculateLoanPayment(principal, rate, years)
      renderResults(
        formatCurrency(monthlyPayment),
        formatCurrency(totalPayment),
        formatCurrency(totalInterest)
      )
    } catch (err) {
      showError((err as Error).message)
    }
  })

  container.appendChild(card)
}

