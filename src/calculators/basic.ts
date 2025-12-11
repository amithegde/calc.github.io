import Decimal from 'decimal.js'
import { evaluateExpression, parseDecimal, HISTORY_KEY } from '../lib/decimal-utils'

type HistoryItem = {
  input: string
  result: string
  timestamp: number
}

const HISTORY_LIMIT = 10

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HistoryItem[]
    return Array.isArray(parsed) ? parsed.slice(0, HISTORY_LIMIT) : []
  } catch {
    return []
  }
}

function saveHistory(history: HistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_LIMIT)))
}

export function mountBasic(container: HTMLElement) {
  const history = loadHistory()

  const wrapper = document.createElement('div')
  wrapper.className = 'grid gap-4 lg:gap-6 grid-cols-1 xl:grid-cols-3'

  const card = document.createElement('div')
  card.className = 'glass-panel xl:col-span-2 p-6'

  const header = document.createElement('div')
  header.className = 'flex items-center justify-between mb-4'
  header.innerHTML = `
    <div>
      <p class="text-sm text-gray-500">Basic arithmetic with Decimal precision</p>
      <h2 class="text-xl font-semibold text-gray-900">Basic Calculator</h2>
    </div>
    <span class="text-xs font-semibold uppercase text-brand-700 bg-brand-50 px-2 py-1 rounded-full">Decimal.js</span>
  `

  const form = document.createElement('form')
  form.className = 'space-y-4'

  const expressionField = document.createElement('div')
  expressionField.innerHTML = `
    <label class="input-label" for="expression">Expression (optional)</label>
    <input id="expression" name="expression" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 12.5 + 3 * 4" class="input-field" aria-describedby="expression-help" />
    <p id="expression-help" class="text-xs text-gray-500 mt-1">If filled, this takes priority over the two-number calculator.</p>
  `

  const grid = document.createElement('div')
  grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4'
  grid.innerHTML = `
    <div>
      <label class="input-label" for="first-number">First number</label>
      <input id="first-number" name="first-number" type="text" inputmode="decimal" pattern="[0-9.-]*" class="input-field" placeholder="0.00" required />
    </div>
    <div>
      <label class="input-label" for="second-number">Second number</label>
      <input id="second-number" name="second-number" type="text" inputmode="decimal" pattern="[0-9.-]*" class="input-field" placeholder="0.00" required />
    </div>
  `

  const operatorRow = document.createElement('div')
  operatorRow.className = 'flex flex-wrap items-center gap-3'
  operatorRow.innerHTML = `
    <div class="flex items-center gap-2">
      <label class="input-label mb-0" for="operator">Operator</label>
      <select id="operator" name="operator" class="input-field w-32">
        <option value="add">Add (+)</option>
        <option value="sub">Subtract (-)</option>
        <option value="mul">Multiply (×)</option>
        <option value="div">Divide (÷)</option>
      </select>
    </div>
    <div class="flex items-center gap-2 text-xs text-gray-600">
      <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-800">i</span>
      <span>Inputs are validated as decimal numbers.</span>
    </div>
  `

  const submitRow = document.createElement('div')
  submitRow.className = 'flex flex-wrap items-center gap-3'
  submitRow.innerHTML = `
    <button type="submit" class="btn-primary">Calculate</button>
    <button type="reset" class="btn-secondary">Reset</button>
    <p class="text-sm text-gray-500">Result updates below and saves to history.</p>
  `

  const errorBox = document.createElement('div')
  errorBox.className = 'hidden rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700'
  errorBox.setAttribute('role', 'alert')

  const resultBox = document.createElement('div')
  resultBox.className =
    'mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 flex items-center gap-3'
  resultBox.innerHTML = `<span class="font-semibold text-gray-600">Result:</span> <span id="result-value" class="text-lg font-semibold text-brand-700">–</span>`

  const historyCard = document.createElement('div')
  historyCard.className = 'glass-panel p-6'
  historyCard.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Recent calculations</h3>
        <p class="text-sm text-gray-500">Stored locally (last ${HISTORY_LIMIT}).</p>
      </div>
      <button type="button" class="btn-secondary" id="clear-history">Clear</button>
    </div>
    <ul id="history-list" class="space-y-2 max-h-72 overflow-auto pr-1"></ul>
  `

  form.append(expressionField, grid, operatorRow, submitRow, errorBox, resultBox)
  wrapper.append(card, historyCard)
  card.append(header, form)
  container.appendChild(wrapper)

  const historyList = historyCard.querySelector('#history-list') as HTMLUListElement
  const clearHistoryBtn = historyCard.querySelector('#clear-history') as HTMLButtonElement
  const resultValue = resultBox.querySelector('#result-value') as HTMLElement

  const showError = (message: string) => {
    errorBox.textContent = message
    errorBox.classList.remove('hidden')
  }

  const clearError = () => {
    errorBox.textContent = ''
    errorBox.classList.add('hidden')
  }

  const renderHistory = () => {
    historyList.innerHTML = ''
    if (history.length === 0) {
      historyList.innerHTML = '<li class="text-sm text-gray-500">No history yet.</li>'
      return
    }

    history.forEach((item) => {
      const li = document.createElement('li')
      li.className =
        'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm flex items-center justify-between gap-3'
      const date = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      li.innerHTML = `
        <div class="flex-1">
          <p class="font-semibold text-gray-800">${item.input}</p>
          <p class="text-xs text-gray-500">${date}</p>
        </div>
        <span class="text-brand-700 font-semibold">${item.result}</span>
      `
      historyList.appendChild(li)
    })
  }

  const pushHistory = (entry: HistoryItem) => {
    history.unshift(entry)
    if (history.length > HISTORY_LIMIT) {
      history.pop()
    }
    saveHistory(history)
    renderHistory()
  }

  const calculateTwoNumber = () => {
    const aInput = (form.querySelector('#first-number') as HTMLInputElement).value
    const bInput = (form.querySelector('#second-number') as HTMLInputElement).value
    const operator = (form.querySelector('#operator') as HTMLSelectElement).value

    const a = parseDecimal(aInput)
    const b = parseDecimal(bInput)

    if (!a || !b) {
      showError('Please enter valid decimal numbers.')
      return null
    }

    let result: Decimal | null = null
    switch (operator) {
      case 'add':
        result = a.add(b)
        break
      case 'sub':
        result = a.sub(b)
        break
      case 'mul':
        result = a.mul(b)
        break
      case 'div':
        if (b.isZero()) {
          showError('Cannot divide by zero.')
          return null
        }
        result = a.div(b)
        break
      default:
        result = null
    }

    if (!result) {
      showError('Could not calculate result.')
      return null
    }

    return { result, summary: `${a.toString()} ${operatorSymbol(operator)} ${b.toString()}` }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    clearError()

    const expressionInput = (form.querySelector('#expression') as HTMLInputElement).value.trim()
    let calculation: { result: Decimal; summary: string } | null = null

    if (expressionInput) {
      const evaluated = evaluateExpression(expressionInput)
      if (!evaluated) {
        showError('Expression is invalid or unsupported.')
        return
      }
      calculation = { result: evaluated, summary: expressionInput }
    } else {
      const twoNumberResult = calculateTwoNumber()
      if (!twoNumberResult) return
      calculation = twoNumberResult
    }

    resultValue.textContent = calculation.result.toString()
    pushHistory({
      input: calculation.summary,
      result: calculation.result.toString(),
      timestamp: Date.now()
    })
  })

  form.addEventListener('reset', () => {
    clearError()
    resultValue.textContent = '–'
  })

  clearHistoryBtn.addEventListener('click', () => {
    history.splice(0, history.length)
    saveHistory(history)
    renderHistory()
  })

  renderHistory()
}

function operatorSymbol(op: string): string {
  switch (op) {
    case 'add':
      return '+'
    case 'sub':
      return '−'
    case 'mul':
      return '×'
    case 'div':
      return '÷'
    default:
      return '?'
  }
}

