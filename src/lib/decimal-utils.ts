import Decimal from 'decimal.js'

export const HISTORY_KEY = 'calc.history'

export function parseDecimal(input: string): Decimal | null {
  if (!input) return null
  const cleaned = input.replace(/,/g, '').trim()
  if (cleaned === '' || !/^-?\d*\.?\d+$/.test(cleaned)) {
    return null
  }
  try {
    return new Decimal(cleaned)
  } catch {
    return null
  }
}

export function formatCurrency(value: Decimal.Value, currency = 'USD'): string {
  const numeric = new Decimal(value).toNumber()
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(numeric)
}

export function roundCurrency(value: Decimal.Value): Decimal {
  return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
}

export function safeDivide(a: Decimal.Value, b: Decimal.Value): Decimal | null {
  const divisor = new Decimal(b)
  if (divisor.isZero()) return null
  return new Decimal(a).div(divisor)
}

export function calculateLoanPayment(principal: Decimal.Value, annualRatePercent: Decimal.Value, years: Decimal.Value) {
  const p = new Decimal(principal)
  const monthlyRate = new Decimal(annualRatePercent).div(100).div(12)
  const months = new Decimal(years).mul(12)

  if (months.lte(0)) {
    throw new Error('Loan term must be greater than zero')
  }

  if (monthlyRate.isZero()) {
    const payment = roundCurrency(p.div(months))
    const totalPayment = payment.mul(months)
    return {
      monthlyPayment: payment,
      totalPayment: roundCurrency(totalPayment),
      totalInterest: roundCurrency(totalPayment.minus(p))
    }
  }

  const numerator = p.mul(monthlyRate)
  const denominator = new Decimal(1).minus(new Decimal(1).plus(monthlyRate).pow(months.neg()))
  const payment = roundCurrency(numerator.div(denominator))
  const totalPayment = payment.mul(months)

  return {
    monthlyPayment: payment,
    totalPayment: roundCurrency(totalPayment),
    totalInterest: roundCurrency(totalPayment.minus(p))
  }
}

export function calculateRoi(initial: Decimal.Value, finalValue: Decimal.Value, years: Decimal.Value) {
  const initialD = new Decimal(initial)
  const finalD = new Decimal(finalValue)
  const yearsD = new Decimal(years)

  if (initialD.eq(0)) {
    throw new Error('Initial value must be greater than zero')
  }

  const totalReturn = finalD.minus(initialD).div(initialD)
  const annualized =
    yearsD.lte(0) || finalD.lte(0)
      ? null
      : finalD.div(initialD).pow(new Decimal(1).div(yearsD)).minus(1)

  return { totalReturn, annualized }
}

export function evaluateExpression(expr: string): Decimal | null {
  const sanitized = expr.replace(/\s+/g, '')
  if (!/^[\d.+\-*/]+$/.test(sanitized)) {
    return null
  }

  const tokens = sanitized.match(/-?\d*\.?\d+|[+*/-]/g)
  if (!tokens || tokens.length === 0) return null

  const output: (string | Decimal)[] = []
  const operators: string[] = []
  const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 }

  for (const token of tokens) {
    if (/^[+*/-]$/.test(token)) {
      while (operators.length) {
        const top = operators[operators.length - 1]
        if (precedence[top] >= precedence[token]) {
          output.push(operators.pop() as string)
        } else {
          break
        }
      }
      operators.push(token)
    } else {
      const decimal = parseDecimal(token)
      if (!decimal) return null
      output.push(decimal)
    }
  }

  while (operators.length) {
    output.push(operators.pop() as string)
  }

  const stack: Decimal[] = []
  for (const token of output) {
    if (token instanceof Decimal) {
      stack.push(token)
      continue
    }

    const b = stack.pop()
    const a = stack.pop()
    if (!a || !b) return null

    switch (token) {
      case '+':
        stack.push(a.add(b))
        break
      case '-':
        stack.push(a.sub(b))
        break
      case '*':
        stack.push(a.mul(b))
        break
      case '/': {
        const division = safeDivide(a, b)
        if (!division) return null
        stack.push(division)
        break
      }
      default:
        return null
    }
  }

  if (stack.length !== 1) return null
  return stack[0]
}

